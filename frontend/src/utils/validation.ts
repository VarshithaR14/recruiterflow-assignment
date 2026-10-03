import type {
  Category,
  Split,
} from '../types/expense';

export type ExpenseFormValues = {
  description: string;
  amount: string;
  paidBy: string;
  date: string;
  category: Category | '';
  splitType: Split['type'];
  selectedMemberIds: string[];
  exactShares: Record<string, string>;
  percentageShares: Record<string, string>;
};

export type ExpenseFormErrors = {
  description?: string;
  amount?: string;
  paidBy?: string;
  date?: string;
  category?: string;
  split?: string;
};

const categories: Category[] = [
  'Food',
  'Travel',
  'Stay',
  'Activities',
  'Other',
];

function isCategory(
  value: Category | '',
): value is Category {
  return value !== '' && categories.includes(value);
}

export function parseAmountToPaise(
  value: string,
): number | null {
  const trimmed = value.trim();

  /*
   * Accept:
   * 100
   * 100.5
   * 100.50
   *
   * Reject:
   * 100.123
   * -100
   * 100abc
   * empty values
   */
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }

  const [rupeesPart, paisePart = ''] =
    trimmed.split('.');

  const rupees = Number(rupeesPart);
  const paise = Number(
    paisePart.padEnd(2, '0'),
  );

  if (!Number.isSafeInteger(rupees)) {
    return null;
  }

  const amount =
    rupees * 100 + paise;

  if (!Number.isSafeInteger(amount)) {
    return null;
  }

  return amount;
}

export function validateExpenseForm(
  values: ExpenseFormValues,
): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};

  /*
   * Description
   */
  const description =
    values.description.trim();

  if (description.length === 0) {
    errors.description =
      'Description is required.';
  } else if (description.length > 60) {
    errors.description =
      'Description must be 60 characters or fewer.';
  }

  /*
   * Amount
   */
  const amount = parseAmountToPaise(
    values.amount,
  );

  if (
    amount === null ||
    amount <= 0
  ) {
    errors.amount =
      'Enter an amount greater than ₹0 with at most 2 decimal places.';
  } else if (amount > 100000000) {
    /*
     * ₹10,00,000 = 100000000 paise
     */
    errors.amount =
      'Amount cannot exceed ₹10,00,000.';
  }

  /*
   * Paid by
   */
  if (values.paidBy === '') {
    errors.paidBy =
      'Paid by is required.';
  }

  /*
   * Date
   */
  if (values.date === '') {
    errors.date =
      'Date is required.';
  } else {
    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    if (values.date > today) {
      errors.date =
        'Date cannot be in the future.';
    }
  }

  /*
   * Category
   */
  if (!isCategory(values.category)) {
    errors.category =
      'Category is required.';
  }

  /*
   * Equal split
   */
  if (
    values.splitType === 'equal'
  ) {
    if (
      values.selectedMemberIds.length === 0
    ) {
      errors.split =
        'Select at least one member.';
    }
  }

  /*
   * Exact split
   */
  if (
    values.splitType === 'exact'
  ) {
    if (
      values.selectedMemberIds.length === 0
    ) {
      errors.split =
        'Select at least one member.';
    } else if (amount !== null) {
      let total = 0;

      for (const memberId of
        values.selectedMemberIds) {
        const share =
          parseAmountToPaise(
            values.exactShares[
              memberId
            ] ?? '',
          );

        if (
          share === null ||
          share < 0
        ) {
          errors.split =
            'Enter valid non-negative exact shares.';
          break;
        }

        total += share;
      }

      if (
        errors.split === undefined &&
        total !== amount
      ) {
        errors.split =
          `Exact shares must total ${formatRemaining(
            amount - total,
          )}.`;
      }
    }
  }

  /*
   * Percentage split
   */
  if (
    values.splitType === 'percent'
  ) {
    if (
      values.selectedMemberIds.length === 0
    ) {
      errors.split =
        'Select at least one member.';
    } else {
      let total = 0;

      for (const memberId of
        values.selectedMemberIds) {
        const raw =
          values.percentageShares[
            memberId
          ] ?? '';

        /*
         * Percentages may contain
         * at most two decimal places.
         */
        if (
          !/^\d+(\.\d{1,2})?$/.test(
            raw.trim(),
          )
        ) {
          errors.split =
            'Enter valid percentages.';
          break;
        }

        const percentage =
          Number(raw);

        if (
          !Number.isFinite(
            percentage,
          ) ||
          percentage < 0 ||
          percentage > 100
        ) {
          errors.split =
            'Percentages must be between 0 and 100.';
          break;
        }

        total += percentage;
      }

      /*
       * Compare in hundredths so that
       * 33.33 + 33.33 + 33.34
       * is treated as exactly 100%.
       */
      if (
        errors.split === undefined &&
        Math.round(total * 100) !==
          10000
      ) {
        errors.split =
          `Percentages must total 100%. Currently ${total.toFixed(
            2,
          )}%.`;
      }
    }
  }

  return errors;
}

function formatRemaining(
  paise: number,
): string {
  const sign =
    paise < 0 ? '-' : '';

  const absolute =
    Math.abs(paise);

  const rupees =
    Math.floor(absolute / 100);

  const cents =
    String(absolute % 100).padStart(
      2,
      '0',
    );

  return `₹${sign}${rupees}.${cents} left to assign`;
}
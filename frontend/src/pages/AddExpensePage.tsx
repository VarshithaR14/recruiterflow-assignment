import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addExpense } from '../store/slices/expensesSlice';
import type {
  Category,
  Expense,
  Split,
} from '../types/expense';
import { formatMoney } from '../utils/money';
import { calculateShares } from '../utils/splitting';
import {
  parseAmountToPaise,
  validateExpenseForm,
  type ExpenseFormErrors,
  type ExpenseFormValues,
} from '../utils/validation';

const categories: Category[] = [
  'Food',
  'Travel',
  'Stay',
  'Activities',
  'Other',
];

function getToday(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0');
  const day = String(
    today.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isCategory(
  value: string,
): value is Category {
  return (
    value === 'Food' ||
    value === 'Travel' ||
    value === 'Stay' ||
    value === 'Activities' ||
    value === 'Other'
  );
}

function isSplitType(
  value: string,
): value is ExpenseFormValues['splitType'] {
  return (
    value === 'equal' ||
    value === 'exact' ||
    value === 'percent'
  );
}

function AddExpensePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const members = useAppSelector(
    (state) => state.members,
  );

  const [formValues, setFormValues] =
    useState<ExpenseFormValues>({
      description: '',
      amount: '',
      paidBy: '',
      date: getToday(),
      category: '',
      splitType: 'equal',
      selectedMemberIds: [],
      exactShares: {},
      percentageShares: {},
    });

  const [errors, setErrors] =
    useState<ExpenseFormErrors>({});

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const { name, value } = event.target;

    if (
      name !== 'description' &&
      name !== 'amount'
    ) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePaidByChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    setFormValues((current) => ({
      ...current,
      paidBy: event.target.value,
    }));
  };

  const handleDateChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setFormValues((current) => ({
      ...current,
      date: event.target.value,
    }));
  };

  const handleCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const value = event.target.value;

    setFormValues((current) => ({
      ...current,
      category: isCategory(value) ? value : '',
    }));
  };

  const handleSplitTypeChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = event.target.value;

    if (!isSplitType(value)) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      splitType: value,
      selectedMemberIds: [],
      exactShares: {},
      percentageShares: {},
    }));
  };

  const handleMemberChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const memberId = event.target.value;
    const checked = event.target.checked;

    setFormValues((current) => {
      const selectedMemberIds = checked
        ? [
            ...current.selectedMemberIds,
            memberId,
          ]
        : current.selectedMemberIds.filter(
            (id) => id !== memberId,
          );

      const exactShares = {
        ...current.exactShares,
      };

      const percentageShares = {
        ...current.percentageShares,
      };

      if (!checked) {
        delete exactShares[memberId];
        delete percentageShares[memberId];
      }

      if (
        checked &&
        current.splitType === 'exact'
      ) {
        exactShares[memberId] = '';
      }

      if (
        checked &&
        current.splitType === 'percent'
      ) {
        percentageShares[memberId] = '';
      }

      return {
        ...current,
        selectedMemberIds,
        exactShares,
        percentageShares,
      };
    });
  };

  const handleExactShareChange = (
    memberId: string,
    value: string,
  ): void => {
    setFormValues((current) => ({
      ...current,
      exactShares: {
        ...current.exactShares,
        [memberId]: value,
      },
    }));
  };

  const handlePercentageShareChange = (
    memberId: string,
    value: string,
  ): void => {
    setFormValues((current) => ({
      ...current,
      percentageShares: {
        ...current.percentageShares,
        [memberId]: value,
      },
    }));
  };

  const buildSplit = (): Split => {
    if (formValues.splitType === 'equal') {
      return {
        type: 'equal',
        memberIds:
          formValues.selectedMemberIds,
      };
    }

    if (formValues.splitType === 'exact') {
      const shares: Record<string, number> = {};

      for (const memberId of formValues.selectedMemberIds) {
        const value =
          formValues.exactShares[memberId] ?? '';

        const paise = parseAmountToPaise(value);

        shares[memberId] = paise ?? 0;
      }

      return {
        type: 'exact',
        shares,
      };
    }

    const shares: Record<string, number> = {};

    for (const memberId of formValues.selectedMemberIds) {
      const value =
        formValues.percentageShares[memberId] ?? '';

      const percentage = Number(value);

      shares[memberId] = Number.isFinite(
        percentage,
      )
        ? percentage
        : 0;
    }

    return {
      type: 'percent',
      shares,
    };
  };

  const calculatedShares = useMemo(() => {
    const amount = parseAmountToPaise(
      formValues.amount,
    );

    if (
      amount === null ||
      amount <= 0 ||
      formValues.selectedMemberIds.length === 0
    ) {
      return null;
    }

    let split: Split;

    if (formValues.splitType === 'equal') {
      split = {
        type: 'equal',
        memberIds:
          formValues.selectedMemberIds,
      };
    } else if (
      formValues.splitType === 'exact'
    ) {
      const shares: Record<string, number> = {};

      for (const memberId of formValues.selectedMemberIds) {
        const value =
          formValues.exactShares[memberId] ?? '';

        shares[memberId] =
          parseAmountToPaise(value) ?? 0;
      }

      split = {
        type: 'exact',
        shares,
      };
    } else {
      const shares: Record<string, number> = {};

      for (const memberId of formValues.selectedMemberIds) {
        const value =
          formValues.percentageShares[memberId] ?? '';

        const percentage = Number(value);

        shares[memberId] = Number.isFinite(
          percentage,
        )
          ? percentage
          : 0;
      }

      split = {
        type: 'percent',
        shares,
      };
    }

    return calculateShares(amount, split);
  }, [
    formValues.amount,
    formValues.splitType,
    formValues.selectedMemberIds,
    formValues.exactShares,
    formValues.percentageShares,
  ]);

  const calculationTotal = useMemo(() => {
    if (calculatedShares === null) {
      return 0;
    }

    return Object.values(
      calculatedShares,
    ).reduce(
      (total, share) => total + share,
      0,
    );
  }, [calculatedShares]);

  const enteredAmount =
    parseAmountToPaise(formValues.amount);

  const remainingAmount =
    enteredAmount !== null
      ? enteredAmount - calculationTotal
      : 0;

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    const validationErrors =
      validateExpenseForm(formValues);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    const amount =
      parseAmountToPaise(formValues.amount);

    if (amount === null) {
      return;
    }

    if (!isCategory(formValues.category)) {
      return;
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      description:
        formValues.description.trim(),
      amount,
      paidBy: formValues.paidBy,
      date: formValues.date,
      category: formValues.category,
      split: buildSplit(),
    };

    dispatch(addExpense(expense));
    navigate('/');
  };

  return (
    <main className="page-container">
      <header className="page-header">
        <h1>Add Expense</h1>
        <p>Add a shared trip expense.</p>
      </header>

      <form
        className="expense-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="form-field">
          <label htmlFor="description">
            Description
          </label>

          <input
            id="description"
            name="description"
            type="text"
            value={formValues.description}
            onChange={handleTextChange}
            maxLength={60}
            aria-invalid={
              errors.description
                ? 'true'
                : 'false'
            }
            aria-describedby={
              errors.description
                ? 'description-error'
                : undefined
            }
          />

          {errors.description && (
            <p
              id="description-error"
              className="form-error"
              role="alert"
            >
              {errors.description}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="amount">
            Amount (₹)
          </label>

          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            value={formValues.amount}
            onChange={handleTextChange}
            placeholder="0.00"
            aria-invalid={
              errors.amount
                ? 'true'
                : 'false'
            }
            aria-describedby={
              errors.amount
                ? 'amount-error'
                : undefined
            }
          />

          {errors.amount && (
            <p
              id="amount-error"
              className="form-error"
              role="alert"
            >
              {errors.amount}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="paidBy">
            Paid by
          </label>

          <select
            id="paidBy"
            value={formValues.paidBy}
            onChange={handlePaidByChange}
            aria-invalid={
              errors.paidBy
                ? 'true'
                : 'false'
            }
            aria-describedby={
              errors.paidBy
                ? 'paidBy-error'
                : undefined
            }
          >
            <option value="">
              Select member
            </option>

            {members.map((member) => (
              <option
                key={member.id}
                value={member.id}
              >
                {member.name}
              </option>
            ))}
          </select>

          {errors.paidBy && (
            <p
              id="paidBy-error"
              className="form-error"
              role="alert"
            >
              {errors.paidBy}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="date">
            Date
          </label>

          <input
            id="date"
            type="date"
            value={formValues.date}
            onChange={handleDateChange}
            aria-invalid={
              errors.date
                ? 'true'
                : 'false'
            }
            aria-describedby={
              errors.date
                ? 'date-error'
                : undefined
            }
          />

          {errors.date && (
            <p
              id="date-error"
              className="form-error"
              role="alert"
            >
              {errors.date}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="category">
            Category
          </label>

          <select
            id="category"
            value={formValues.category}
            onChange={handleCategoryChange}
            aria-invalid={
              errors.category
                ? 'true'
                : 'false'
            }
            aria-describedby={
              errors.category
                ? 'category-error'
                : undefined
            }
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          {errors.category && (
            <p
              id="category-error"
              className="form-error"
              role="alert"
            >
              {errors.category}
            </p>
          )}
        </div>

        <fieldset>
          <legend>Split type</legend>

          <label>
            <input
              type="radio"
              name="splitType"
              value="equal"
              checked={
                formValues.splitType === 'equal'
              }
              onChange={handleSplitTypeChange}
            />
            Equal
          </label>

          <label>
            <input
              type="radio"
              name="splitType"
              value="exact"
              checked={
                formValues.splitType === 'exact'
              }
              onChange={handleSplitTypeChange}
            />
            Exact
          </label>

          <label>
            <input
              type="radio"
              name="splitType"
              value="percent"
              checked={
                formValues.splitType === 'percent'
              }
              onChange={handleSplitTypeChange}
            />
            Percentage
          </label>
        </fieldset>

        <fieldset>
          <legend>
            {formValues.splitType === 'equal'
              ? 'Split between'
              : formValues.splitType === 'exact'
                ? 'Exact shares'
                : 'Percentage shares'}
          </legend>

          {members.map((member) => {
            const selected =
              formValues.selectedMemberIds.includes(
                member.id,
              );

            return (
              <div
                key={member.id}
                className="split-member"
              >
                <label>
                  <input
                    type="checkbox"
                    value={member.id}
                    checked={selected}
                    onChange={handleMemberChange}
                  />
                  {member.name}
                </label>

                {formValues.splitType ===
                  'exact' &&
                  selected && (
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="₹0.00"
                      value={
                        formValues.exactShares[
                          member.id
                        ] ?? ''
                      }
                      onChange={(event) =>
                        handleExactShareChange(
                          member.id,
                          event.target.value,
                        )
                      }
                      aria-label={`Exact share for ${member.name}`}
                    />
                  )}

                {formValues.splitType ===
                  'percent' &&
                  selected && (
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00%"
                      value={
                        formValues
                          .percentageShares[
                          member.id
                        ] ?? ''
                      }
                      onChange={(event) =>
                        handlePercentageShareChange(
                          member.id,
                          event.target.value,
                        )
                      }
                      aria-label={`Percentage share for ${member.name}`}
                    />
                  )}
              </div>
            );
          })}

          {errors.split && (
            <p
              className="form-error"
              role="alert"
            >
              {errors.split}
            </p>
          )}
        </fieldset>

        {calculatedShares !== null && (
          <section
            className="calculation-preview"
            aria-labelledby="calculation-heading"
          >
            <h2 id="calculation-heading">
              Split calculation
            </h2>

            <div className="calculation-list">
              {members
                .filter((member) =>
                  formValues.selectedMemberIds.includes(
                    member.id,
                  ),
                )
                .map((member) => (
                  <div
                    key={member.id}
                    className="calculation-row"
                  >
                    <span>{member.name}</span>

                    <strong>
                      {formatMoney(
                        calculatedShares[
                          member.id
                        ] ?? 0,
                      )}
                    </strong>
                  </div>
                ))}
            </div>

            <div className="calculation-total">
              <span>Total</span>

              <strong>
                {formatMoney(calculationTotal)}
              </strong>
            </div>

            {formValues.splitType !==
              'equal' &&
              remainingAmount !== 0 && (
                <p className="form-error">
                  {remainingAmount > 0
                    ? `${formatMoney(
                        remainingAmount,
                      )} left to assign`
                    : `${formatMoney(
                        Math.abs(
                          remainingAmount,
                        ),
                      )} over the amount`}
                </p>
              )}
          </section>
        )}

        <button type="submit">
          Add Expense
        </button>
      </form>
    </main>
  );
}

export default AddExpensePage;
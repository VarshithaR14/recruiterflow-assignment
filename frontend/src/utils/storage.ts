import type {
  Category,
  Expense,
  Member,
  Split,
} from '../types/expense';

const MEMBERS_KEY = 'trip-splitter-members';
const EXPENSES_KEY = 'trip-splitter-expenses';

type SavedData = {
  members: Member[];
  expenses: Expense[];
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  );
}

function isCategory(
  value: unknown,
): value is Category {
  return (
    value === 'Food' ||
    value === 'Travel' ||
    value === 'Stay' ||
    value === 'Activities' ||
    value === 'Other'
  );
}

function isMember(
  value: unknown,
): value is Member {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.name === 'string' &&
    value.name.length > 0
  );
}

function isShareRecord(
  value: unknown,
): value is Record<string, number> {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (share) =>
      typeof share === 'number' &&
      Number.isFinite(share) &&
      share >= 0,
  );
}

function isSplit(
  value: unknown,
): value is Split {
  if (
    !isRecord(value) ||
    typeof value.type !== 'string'
  ) {
    return false;
  }

  if (value.type === 'equal') {
    return (
      Array.isArray(value.memberIds) &&
      value.memberIds.length > 0 &&
      value.memberIds.every(
        (memberId) =>
          typeof memberId === 'string' &&
          memberId.length > 0,
      )
    );
  }

  if (
    value.type === 'exact' ||
    value.type === 'percent'
  ) {
    return isShareRecord(value.shares);
  }

  return false;
}

function isExpense(
  value: unknown,
): value is Expense {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.description === 'string' &&
    value.description.length > 0 &&
    typeof value.amount === 'number' &&
    Number.isInteger(value.amount) &&
    value.amount > 0 &&
    typeof value.paidBy === 'string' &&
    value.paidBy.length > 0 &&
    typeof value.date === 'string' &&
    value.date.length > 0 &&
    isCategory(value.category) &&
    isSplit(value.split)
  );
}

function isValidSavedData(
  data: unknown,
): data is SavedData {
  if (!isRecord(data)) {
    return false;
  }

  return (
    Array.isArray(data.members) &&
    data.members.every(isMember) &&
    Array.isArray(data.expenses) &&
    data.expenses.every(isExpense)
  );
}

export function loadSavedData(): SavedData | null {
  try {
    const membersJson =
      localStorage.getItem(MEMBERS_KEY);

    const expensesJson =
      localStorage.getItem(EXPENSES_KEY);

    if (
      membersJson === null ||
      expensesJson === null
    ) {
      return null;
    }

    const data: unknown = {
      members: JSON.parse(membersJson),
      expenses: JSON.parse(expensesJson),
    };

    if (!isValidSavedData(data)) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function saveData(
  members: Member[],
  expenses: Expense[],
): void {
  try {
    localStorage.setItem(
      MEMBERS_KEY,
      JSON.stringify(members),
    );

    localStorage.setItem(
      EXPENSES_KEY,
      JSON.stringify(expenses),
    );
  } catch {
    // Ignore storage failures.
  }
}
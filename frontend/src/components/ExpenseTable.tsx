import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteExpense } from '../store/slices/expensesSlice';
import type { Category } from '../types/expense';
import { formatMoney } from '../utils/money';

type ExpenseTableProps = {
  category: Category | 'All';
};

function ExpenseTable({
  category,
}: ExpenseTableProps) {
  const dispatch = useAppDispatch();

  const members = useAppSelector((state) => state.members);
  const expenses = useAppSelector((state) => state.expenses);

  const visibleExpenses = useMemo(() => {
    return [...expenses]
      .filter(
        (expense) =>
          category === 'All' ||
          expense.category === category,
      )
      .sort((a, b) =>
        b.date.localeCompare(a.date),
      );
  }, [expenses, category]);

  const total = visibleExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const getMemberName = (memberId: string): string => {
    return (
      members.find(
        (member) => member.id === memberId,
      )?.name ?? 'Unknown'
    );
  };

  const handleDelete = (expenseId: string): void => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this expense?',
    );

    if (confirmed) {
      dispatch(deleteExpense(expenseId));
    }
  };

  if (visibleExpenses.length === 0) {
    return (
      <section aria-live="polite">
        <p>No expenses found.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="expenses-heading">
      <div className="expenses-header">
        <div>
          <h2 id="expenses-heading">Expenses</h2>
          <p>
            Displayed total: {formatMoney(total)}
          </p>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <caption className="sr-only">
            Trip expenses
          </caption>

          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Amount</th>
              <th scope="col">Paid by</th>
              <th scope="col">Date</th>
              <th scope="col">Category</th>
              <th scope="col">Action</th>
            </tr>
          </thead>

          <tbody>
            {visibleExpenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.description}</td>
                <td>{formatMoney(expense.amount)}</td>
                <td>{getMemberName(expense.paidBy)}</td>
                <td>{expense.date}</td>
                <td>{expense.category}</td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(expense.id)
                    }
                    aria-label={`Delete ${expense.description}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ExpenseTable;
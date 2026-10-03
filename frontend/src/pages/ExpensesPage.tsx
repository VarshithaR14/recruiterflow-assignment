import { useState } from 'react';

import BalanceSummary from '../components/BalanceSummary';
import CategoryFilter from '../components/CategoryFilter';
import ExpenseTable from '../components/ExpenseTable';
import type { Category } from '../types/expense';

function ExpensesPage() {
  const [category, setCategory] =
    useState<Category | 'All'>('All');

  return (
    <main className="page-container">
      <header className="page-header">
        <h1>Expenses</h1>

        <p>
          Track your trip expenses and balances.
        </p>
      </header>

      <BalanceSummary />

      <div className="filter-row">
        <CategoryFilter
          value={category}
          onChange={setCategory}
        />
      </div>

      <ExpenseTable category={category} />
    </main>
  );
}

export default ExpensesPage;
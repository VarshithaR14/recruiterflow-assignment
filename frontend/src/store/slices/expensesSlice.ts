import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { sampleExpenses } from '../../data/sample-data';
import type { Expense } from '../../types/expense';

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: sampleExpenses,
  reducers: {
    addExpense: (
      state,
      action: PayloadAction<Expense>,
    ) => {
      state.push(action.payload);
    },

    deleteExpense: (
      state,
      action: PayloadAction<string>,
    ) => {
      const index = state.findIndex(
        (expense) => expense.id === action.payload,
      );

      if (index !== -1) {
        state.splice(index, 1);
      }
    },
  },
});

export const {
  addExpense,
  deleteExpense,
} = expensesSlice.actions;

export default expensesSlice.reducer;
import { configureStore } from '@reduxjs/toolkit';

import { sampleExpenses, sampleMembers } from '../data/sample-data';
import { loadSavedData, saveData } from '../utils/storage';
import expensesReducer from './slices/expensesSlice';
import membersReducer from './slices/membersSlice';

const savedData = loadSavedData();

export const store = configureStore({
  reducer: {
    members: membersReducer,
    expenses: expensesReducer,
  },

  preloadedState: savedData ?? {
    members: sampleMembers,
    expenses: sampleExpenses,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

store.subscribe(() => {
  const state = store.getState();

  saveData(
    state.members,
    state.expenses,
  );
});
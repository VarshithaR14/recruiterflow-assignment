import type { Expense, Member } from '../types/expense';
import { calculateShares } from './splitting';

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
): Record<string, number> {
  const balances: Record<string, number> = {};

  for (const member of members) {
    balances[member.id] = 0;
  }

  for (const expense of expenses) {
    const shares = calculateShares(
      expense.amount,
      expense.split,
    );

    balances[expense.paidBy] += expense.amount;

    for (const [memberId, share] of Object.entries(shares)) {
      balances[memberId] -= share;
    }
  }

  return balances;
}
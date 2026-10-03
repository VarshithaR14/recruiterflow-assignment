import { describe, expect, it } from 'vitest';

import { calculateBalances } from '../utils/balances';
import type { Expense, Member } from '../types/expense';

const members: Member[] = [
  { id: 'm1', name: 'Aarav' },
  { id: 'm2', name: 'Diya' },
  { id: 'm3', name: 'Kabir' },
];

describe('calculateBalances', () => {
  it('calculates balances for an equal split', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Dinner',
        amount: 10000,
        paidBy: 'm1',
        date: '2026-03-15',
        category: 'Food',
        split: {
          type: 'equal',
          memberIds: ['m1', 'm2'],
        },
      },
    ];

    const balances = calculateBalances(
      members,
      expenses,
    );

    expect(balances).toEqual({
      m1: 5000,
      m2: -5000,
      m3: 0,
    });
  });

  it('handles a payer who is not part of the split', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Dinner',
        amount: 9000,
        paidBy: 'm1',
        date: '2026-03-15',
        category: 'Food',
        split: {
          type: 'equal',
          memberIds: ['m2', 'm3'],
        },
      },
    ];

    const balances = calculateBalances(
      members,
      expenses,
    );

    expect(balances).toEqual({
      m1: 9000,
      m2: -4500,
      m3: -4500,
    });
  });

  it('keeps the total balance exactly zero', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Dinner',
        amount: 10000,
        paidBy: 'm1',
        date: '2026-03-15',
        category: 'Food',
        split: {
          type: 'equal',
          memberIds: ['m1', 'm2', 'm3'],
        },
      },
    ];

    const balances = calculateBalances(
      members,
      expenses,
    );

    const total = Object.values(balances).reduce(
      (sum, balance) => sum + balance,
      0,
    );

    expect(total).toBe(0);
  });

  it('handles multiple expenses correctly', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Dinner',
        amount: 9000,
        paidBy: 'm1',
        date: '2026-03-15',
        category: 'Food',
        split: {
          type: 'equal',
          memberIds: ['m1', 'm2', 'm3'],
        },
      },
      {
        id: 'e2',
        description: 'Taxi',
        amount: 6000,
        paidBy: 'm2',
        date: '2026-03-16',
        category: 'Travel',
        split: {
          type: 'equal',
          memberIds: ['m1', 'm2'],
        },
      },
    ];

    const balances = calculateBalances(
      members,
      expenses,
    );

    expect(balances).toEqual({
      m1: 3000,
      m2: 0,
      m3: -3000,
    });

    const total = Object.values(balances).reduce(
      (sum, balance) => sum + balance,
      0,
    );

    expect(total).toBe(0);
  });
});
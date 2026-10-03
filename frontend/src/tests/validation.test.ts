import { describe, expect, it } from 'vitest';

import {
  parseAmountToPaise,
  validateExpenseForm,
  type ExpenseFormValues,
} from '../utils/validation';

const validValues: ExpenseFormValues = {
  description: 'Dinner',
  amount: '100',
  paidBy: 'm1',
  date: '2026-09-15',
  category: 'Food',
  splitType: 'equal',
  selectedMemberIds: ['m1', 'm2', 'm3'],
  exactShares: {},
  percentageShares: {},
};

describe('parseAmountToPaise', () => {
  it('converts rupees to integer paise', () => {
    expect(parseAmountToPaise('100')).toBe(10000);
    expect(parseAmountToPaise('100.50')).toBe(10050);
    expect(parseAmountToPaise('1499.99')).toBe(
      149999,
    );
  });

  it('rejects more than two decimal places', () => {
    expect(parseAmountToPaise('100.123')).toBeNull();
  });
});

describe('validateExpenseForm', () => {
  it('accepts a valid equal split', () => {
    const errors =
      validateExpenseForm(validValues);

    expect(errors).toEqual({});
  });

  it('requires a description', () => {
    const errors = validateExpenseForm({
      ...validValues,
      description: '',
    });

    expect(errors.description).toBe(
      'Description is required.',
    );
  });

  it('rejects a description longer than 60 characters', () => {
    const errors = validateExpenseForm({
      ...validValues,
      description: 'A'.repeat(61),
    });

    expect(errors.description).toBe(
      'Description must be 60 characters or fewer.',
    );
  });

  it('rejects an invalid amount', () => {
    const errors = validateExpenseForm({
      ...validValues,
      amount: '0',
    });

    expect(errors.amount).toBeDefined();
  });

  it('rejects an amount with more than two decimals', () => {
    const errors = validateExpenseForm({
      ...validValues,
      amount: '100.123',
    });

    expect(errors.amount).toBeDefined();
  });

  it('rejects an amount above ₹10,00,000', () => {
    const errors = validateExpenseForm({
      ...validValues,
      amount: '1000000.01',
    });

    expect(errors.amount).toBe(
      'Amount cannot exceed ₹10,00,000.',
    );
  });

  it('requires at least one member for equal split', () => {
    const errors = validateExpenseForm({
      ...validValues,
      selectedMemberIds: [],
    });

    expect(errors.split).toBe(
      'Select at least one member.',
    );
  });

  it('accepts exact shares that equal the amount', () => {
    const errors = validateExpenseForm({
      ...validValues,
      amount: '100',
      splitType: 'exact',
      selectedMemberIds: ['m1', 'm2'],
      exactShares: {
        m1: '60',
        m2: '40',
      },
    });

    expect(errors).toEqual({});
  });

  it('rejects exact shares that do not equal the amount', () => {
    const errors = validateExpenseForm({
      ...validValues,
      amount: '100',
      splitType: 'exact',
      selectedMemberIds: ['m1', 'm2'],
      exactShares: {
        m1: '60',
        m2: '30',
      },
    });

    expect(errors.split).toBeDefined();
  });

  it('accepts percentages totaling exactly 100%', () => {
    const errors = validateExpenseForm({
      ...validValues,
      splitType: 'percent',
      selectedMemberIds: ['m1', 'm2', 'm3'],
      percentageShares: {
        m1: '33.33',
        m2: '33.33',
        m3: '33.34',
      },
    });

    expect(errors).toEqual({});
  });

  it('rejects percentages that do not total 100%', () => {
    const errors = validateExpenseForm({
      ...validValues,
      splitType: 'percent',
      selectedMemberIds: ['m1', 'm2'],
      percentageShares: {
        m1: '50',
        m2: '40',
      },
    });

    expect(errors.split).toContain(
      'Percentages must total 100%.',
    );
  });
});
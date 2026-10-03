import { describe, expect, it } from 'vitest';

import { formatMoney } from '../utils/money';

describe('formatMoney', () => {
  it('formats paise as Indian rupees', () => {
    expect(formatMoney(10000)).toBe('₹100.00');
  });

  it('formats thousands using Indian number formatting', () => {
    expect(formatMoney(325000)).toBe('₹3,250.00');
  });

  it('preserves paise correctly', () => {
    expect(formatMoney(149999)).toBe('₹1,499.99');
  });
});
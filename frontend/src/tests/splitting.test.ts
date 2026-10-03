import { describe, expect, it } from 'vitest';

import {
  calculateEqualShares,
  calculateExactShares,
  calculatePercentageShares,
} from '../utils/splitting';

describe('calculateEqualShares', () => {
  it('splits ₹100 equally between 3 members without losing a paise', () => {
    const shares = calculateEqualShares(10000, {
      type: 'equal',
      memberIds: ['m1', 'm2', 'm3'],
    });

    expect(shares).toEqual({
      m1: 3334,
      m2: 3333,
      m3: 3333,
    });

    expect(
      Object.values(shares).reduce(
        (total, share) => total + share,
        0,
      ),
    ).toBe(10000);
  });

  it('returns an empty object when no members are selected', () => {
    const shares = calculateEqualShares(10000, {
      type: 'equal',
      memberIds: [],
    });

    expect(shares).toEqual({});
  });
});

describe('calculateExactShares', () => {
  it('returns the exact shares provided', () => {
    const shares = calculateExactShares({
      type: 'exact',
      shares: {
        m1: 5000,
        m2: 3000,
        m3: 2000,
      },
    });

    expect(shares).toEqual({
      m1: 5000,
      m2: 3000,
      m3: 2000,
    });
  });
});

describe('calculatePercentageShares', () => {
  it('splits an amount according to percentages exactly', () => {
    const shares = calculatePercentageShares(10000, {
      type: 'percent',
      shares: {
        m1: 50,
        m2: 30,
        m3: 20,
      },
    });

    expect(shares).toEqual({
      m1: 5000,
      m2: 3000,
      m3: 2000,
    });
  });

  it('keeps the total equal to the original amount', () => {
    const shares = calculatePercentageShares(149999, {
      type: 'percent',
      shares: {
        m1: 33.33,
        m2: 33.33,
        m3: 33.34,
      },
    });

    const total = Object.values(shares).reduce(
      (sum, share) => sum + share,
      0,
    );

    expect(total).toBe(149999);
  });
});
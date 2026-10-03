import type {
  EqualSplit,
  ExactSplit,
  PercentageSplit,
  Split,
} from '../types/expense';

/**
 * Splits an amount equally between the selected members.
 *
 * Any leftover paise is assigned from the beginning
 * of the member list.
 *
 * Example:
 * ₹100.00 = 10000 paise
 * 3 members
 *
 * m1 = 3334 paise
 * m2 = 3333 paise
 * m3 = 3333 paise
 */
export function calculateEqualShares(
  amount: number,
  split: EqualSplit,
): Record<string, number> {
  const memberCount = split.memberIds.length;

  if (memberCount === 0) {
    return {};
  }

  const baseShare = Math.floor(amount / memberCount);
  const remainder = amount % memberCount;

  const shares: Record<string, number> = {};

  split.memberIds.forEach((memberId, index) => {
    shares[memberId] =
      baseShare + (index < remainder ? 1 : 0);
  });

  return shares;
}

/**
 * Returns a copy of the exact shares.
 *
 * Exact shares are already stored in paise.
 */
export function calculateExactShares(
  split: ExactSplit,
): Record<string, number> {
  return { ...split.shares };
}

/**
 * Calculates shares from percentages.
 *
 * All calculations are performed using paise.
 *
 * We use the largest-remainder method:
 *
 * 1. Calculate the exact fractional share for every member.
 * 2. Give each member the whole-paise floor.
 * 3. Calculate how many paise are still unassigned.
 * 4. Give the remaining paise to members with the
 *    largest fractional remainders.
 *
 * This guarantees that, for valid percentages totaling
 * exactly 100%, the final shares add up exactly to
 * the expense amount.
 */
export function calculatePercentageShares(
  amount: number,
  split: PercentageSplit,
): Record<string, number> {
  const shares: Record<string, number> = {};

  const calculations: Array<{
    memberId: string;
    wholePaise: number;
    remainder: number;
  }> = [];

  let assignedPaise = 0;

  for (const [memberId, percentage] of Object.entries(
    split.shares,
  )) {
    /*
     * Percentages can have up to two decimal places.
     *
     * Example:
     * 33.33% → 3333 hundredths of a percent
     *
     * amount is in paise.
     *
     * amount × percentageHundredths / 10000
     * gives the exact share in paise.
     */
    const percentageHundredths = Math.round(
      percentage * 100,
    );

    const numerator = amount * percentageHundredths;

    const wholePaise = Math.floor(numerator / 10000);
    const remainder = numerator % 10000;

    calculations.push({
      memberId,
      wholePaise,
      remainder,
    });

    shares[memberId] = wholePaise;
    assignedPaise += wholePaise;
  }

  /*
   * Find how many paise are still unassigned.
   */
  let remainingPaise = amount - assignedPaise;

  /*
   * Give leftover paise to the members with the
   * largest fractional remainders.
   *
   * If two members have the same remainder, their
   * original order is preserved.
   */
  calculations.sort((a, b) => b.remainder - a.remainder);

  let index = 0;

  while (remainingPaise > 0 && calculations.length > 0) {
    const calculation = calculations[index];

    shares[calculation.memberId] += 1;
    remainingPaise -= 1;

    index += 1;

    if (index === calculations.length) {
      index = 0;
    }
  }

  return shares;
}

/**
 * Calculates the final share of every member based
 * on the split type.
 */
export function calculateShares(
  amount: number,
  split: Split,
): Record<string, number> {
  switch (split.type) {
    case 'equal':
      return calculateEqualShares(amount, split);

    case 'exact':
      return calculateExactShares(split);

    case 'percent':
      return calculatePercentageShares(amount, split);
  }
}
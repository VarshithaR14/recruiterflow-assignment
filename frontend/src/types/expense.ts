export type Member = {
  id: string;
  name: string;
};

export type Category =
  | 'Food'
  | 'Travel'
  | 'Stay'
  | 'Activities'
  | 'Other';

export type EqualSplit = {
  type: 'equal';
  memberIds: string[];
};

export type ExactSplit = {
  type: 'exact';
  shares: Record<string, number>;
};

export type PercentageSplit = {
  type: 'percent';
  shares: Record<string, number>;
};

export type Split =
  | EqualSplit
  | ExactSplit
  | PercentageSplit;

export type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  category: Category;
  split: Split;
};
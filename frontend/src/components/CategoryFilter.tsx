import type { Category } from '../types/expense';

type CategoryFilterProps = {
  value: Category | 'All';
  onChange: (value: Category | 'All') => void;
};

const categories: Array<Category | 'All'> = [
  'All',
  'Food',
  'Travel',
  'Stay',
  'Activities',
  'Other',
];

function isCategoryFilter(value: string): value is Category | 'All' {
  return (
    value === 'All' ||
    value === 'Food' ||
    value === 'Travel' ||
    value === 'Stay' ||
    value === 'Activities' ||
    value === 'Other'
  );
}

function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <label>
      Category
      <select
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;

          if (isCategoryFilter(nextValue)) {
            onChange(nextValue);
          }
        }}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>
  );
}

export default CategoryFilter;
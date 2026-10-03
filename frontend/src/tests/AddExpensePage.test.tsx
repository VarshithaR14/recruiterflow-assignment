import '@testing-library/jest-dom/vitest';

import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import {
  describe,
  expect,
  it,
} from 'vitest';

import AddExpensePage from '../pages/AddExpensePage';
import { store } from '../store/store';

function renderPage() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AddExpensePage />
      </MemoryRouter>
    </Provider>,
  );
}

describe('AddExpensePage', () => {
  it('shows validation errors when required fields are missing', () => {
    renderPage();

    const submitButton =
      screen.getByRole('button', {
        name: 'Add Expense',
      });

    fireEvent.click(submitButton);

    expect(
      screen.getByText(
        'Description is required.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Enter an amount greater than ₹0 with at most 2 decimal places.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Paid by is required.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Category is required.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Select at least one member.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the equal split calculation for selected members', () => {
    renderPage();

    const amountInput =
      screen.getByLabelText('Amount (₹)');

    fireEvent.change(amountInput, {
      target: {
        value: '100',
      },
    });

    const aaravCheckbox =
      screen.getByRole('checkbox', {
        name: 'Aarav',
      });

    const diyaCheckbox =
      screen.getByRole('checkbox', {
        name: 'Diya',
      });

    const kabirCheckbox =
      screen.getByRole('checkbox', {
        name: 'Kabir',
      });

    fireEvent.click(aaravCheckbox);
    fireEvent.click(diyaCheckbox);
    fireEvent.click(kabirCheckbox);

    expect(
      screen.getByRole('heading', {
        name: 'Split calculation',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('₹33.34'),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText('₹33.33'),
    ).toHaveLength(2);

    expect(
      screen.getByText('₹100.00'),
    ).toBeInTheDocument();
  });
});
Trip Splitter
A responsive React + TypeScript expense-splitting application for tracking trip expenses, calculating member balances, and splitting expenses equally, by exact amounts, or by percentages.
Tech Stack
- React + TypeScript
- Vite
- Redux Toolkit
- React Router
- Vitest
- React Testing Library
- ESLint
- LocalStorage
Getting Started
Install dependencies:
npm install

Start the development server:
npm run dev

Available Scripts
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test

Implementation Decisions
1. Money is stored in paise
All monetary values are stored as integer paise instead of floating-point rupees. This prevents rounding errors and ensures balances always sum exactly to zero.
2. Deterministic extra-paise rule
For equal splits, the base share is calculated in paise and any leftover paise is assigned from the beginning of the selected member list.
For example, ₹100 split among three members becomes:
- ₹33.34
- ₹33.33
- ₹33.33
This ensures that no paise is lost or invented.
3. Business logic is separated from UI
Money parsing, validation, splitting, and balance calculations are implemented in plain TypeScript utility modules rather than inside React components. This makes the logic easier to test and maintain.
Persistence
Members and expenses are saved to browser localStorage so data survives page reloads.
If saved data is invalid or unreadable, the application falls back to the sample data.
Testing
The project includes automated tests for:
- Equal, exact, and percentage splitting
- Balance calculations
- Money formatting
- Form validation
- Add Expense UI behavior
The test suite contains 27 tests.
Improvements
Given more time, I would add:
- Editing existing expenses
- Detailed settlement suggestions showing who should pay whom
- Additional filtering and sorting options
- More comprehensive end-to-end browser tests
- Improved visual feedback for successful actions
AI Usage
AI assistance was used during development for debugging, implementation suggestions, test-case ideas, accessibility checks, and code-quality review.
All generated suggestions were reviewed, adapted, and tested within the application. The final implementation was verified through TypeScript type checking, ESLint, automated tests, and a production build.
Incomplete
No known required assignment functionality is intentionally incomplete.
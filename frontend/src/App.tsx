import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import AddExpensePage from './pages/AddExpensePage';
import ExpensesPage from './pages/ExpensesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<ExpensesPage />}
        />

        <Route
          path="/expenses/new"
          element={<AddExpensePage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
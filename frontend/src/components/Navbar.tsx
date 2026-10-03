import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <NavLink to="/">
        Expenses
      </NavLink>

      <NavLink to="/expenses/new">
        Add expense
      </NavLink>
    </nav>
  );
}

export default Navbar;
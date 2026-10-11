import { NavLink } from 'react-router-dom';
import styles from './AppNavigation.module.css';

export function AppNavigation() {
  return (
    <nav aria-label="Nawigacja główna">
      <ul className={styles.navigation}>
        <li>
          <NavLink to="/products">Products</NavLink>
        </li>
        <li>
          <NavLink to="/orders">Orders</NavLink>
        </li>
      </ul>
    </nav>
  );
}
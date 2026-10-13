import { NavLink } from 'react-router-dom';
import styles from './AppNavigation.module.css';

export function AppNavigation() {
  return (
    <nav aria-label="Nawigacja główna">
      <ul className={styles.navigation}>
        <li>
          <NavLink to="/products">Produkty</NavLink>
        </li>
        <li>
          <NavLink to="/orders">Zamówienia</NavLink>
        </li>
      </ul>
    </nav>
  );
}
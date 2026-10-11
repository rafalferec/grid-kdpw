import { AppNavigation } from '@/app/components/AppNavigation/AppNavigation';
import { AppRouter } from '@/app/router/AppRouter';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Przejdź do treści
      </a>

      <header className={styles.header}>
        <p className={styles.brand}>KDPW — Store</p>
        <AppNavigation />
      </header>

      <main id="main-content" className={styles.main} tabIndex={-1}>
        <AppRouter />
      </main>
    </div>
  );
}
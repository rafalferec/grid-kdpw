import { Loader } from '@progress/kendo-react-indicators';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Trwa ładowanie danych...',}: LoadingOverlayProps) {
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <Loader type="infinite-spinner" size="medium" themeColor="secondary" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
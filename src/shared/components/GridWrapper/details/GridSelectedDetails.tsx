import { RecordFields } from '@/shared/components/RecordFields/RecordFields';
import styles from './GridSelectedDetails.module.css';
import gridStyles from '../GridWrapper.module.css';

interface GridSelectedDetailsProps<T> {
  data: T;
  id: string;
  onClose: () => void;
}

export function GridSelectedDetails<T extends object>({
  data,
  id,
  onClose,
}: GridSelectedDetailsProps<T>) {
  return (
    <section id={id} className={styles.panel} aria-label="Wyświetlony rekord">
      <div className={styles.header}>
        <h3 className={styles.heading}>Wyświetlony rekord</h3>
        <button type="button" className={gridStyles.actionButton} onClick={onClose}>
          Zamknij
        </button>
      </div>
      <div
        className={styles.content}
        tabIndex={0}
        role="region"
        aria-label="Dane wyświetlonego rekordu"
      >
        <RecordFields data={data} />
      </div>
    </section>
  );
}

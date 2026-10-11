import { RecordFields } from '@/shared/components/RecordFields/RecordFields';
import styles from './GridSelectedDetails.module.css';

interface GridSelectedDetailsProps<T> {
  data: T;
  id: string;
}

export function GridSelectedDetails<T extends object>({
  data,
  id,
}: GridSelectedDetailsProps<T>) {
  return (
    <section id={id} className={styles.panel} aria-label="Selected record">
      <h3 className={styles.heading}>Selected record</h3>
      <div
        className={styles.content}
        tabIndex={0}
        role="region"
        aria-label="Selected record fields"
      >
        <RecordFields data={data} />
      </div>
    </section>
  );
}

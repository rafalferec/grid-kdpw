import styles from './RecordFields.module.css';

interface RecordFieldsProps<T extends object> {
  data: T;
  excludedFields?: readonly (keyof T & string)[];
}

export function RecordFields<T extends object>({
  data,
  excludedFields = [],
}: RecordFieldsProps<T>) {
  return (
    <dl className={styles.fields}>
      {Object.entries(data)
        .filter(([key]) => !excludedFields.some((field) => field === key))
        .map(([key, value]) => (
          <div key={key} className={styles.field}>
            <dt>{key.replaceAll('_', ' ')}</dt>
            <dd>
              {value === null || value === undefined
                ? '—'
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
            </dd>
          </div>
        ))}
    </dl>
  );
}

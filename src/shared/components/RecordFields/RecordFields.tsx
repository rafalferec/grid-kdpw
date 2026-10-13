import styles from './RecordFields.module.css';

interface RecordFieldsProps<T extends object> {
  data: T;
  excludedFields?: readonly (keyof T & string)[];
}

function formatLabel(key: string): string {
  return key.replaceAll('_', ' ');
}

function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return '—';
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => (
      <div key={index}>{renderValue(item)}</div>
    ));
  }

  if (typeof value === 'object') {
    return (
      <dl className={styles.fields}>
        {Object.entries(value).map(([key, nestedValue]) => (
          <div key={key} className={styles.field}>
            <dt>{formatLabel(key)}</dt>
            <dd>{renderValue(nestedValue)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return String(value);
}

export function RecordFields<T extends object>({
  data,
  excludedFields = [],
}: RecordFieldsProps<T>) {
  return (
    <dl className={styles.fields}>
      {Object.entries(data)
        .filter(([key]) => !excludedFields.includes(key as keyof T & string))
        .map(([key, value]) => (
          <div key={key} className={styles.field}>
            <dt>{formatLabel(key)}</dt>
            <dd>{renderValue(value)}</dd>
          </div>
        ))}
    </dl>
  );
}
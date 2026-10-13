import { RecordFields } from "@/shared/components/RecordFields/RecordFields";
import styles from "./RecordDetails.module.css"

interface RecordDetailsProps<T extends object> {
  dataItem: T;
  title: string;
  excludedFields?: readonly (keyof T & string)[];
}

export function RecordDetails<T extends object>({
  dataItem,
  title,
  excludedFields = [],
}: RecordDetailsProps<T>) {
  return (
    <section
      className={styles.details}
      aria-label={`Szczegóły: ${title}`}
    >
      <h3>{title}</h3>

      <RecordFields
        data={dataItem}
        excludedFields={excludedFields}
      />
    </section>
  );
}
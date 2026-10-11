import type { Order } from "./types/order.types";
import { RecordFields } from "@/shared/components/RecordFields/RecordFields";
import { columns } from "./columns";
import styles from "./OrderDetails.module.css";

const summaryFields = columns.map((column) => column.field);

export function OrderDetails({ dataItem }: { dataItem: Order }) {
  return (
    <section className={styles.details} aria-label={`Szczegóły zamówienia ${dataItem.number}`}>
      <h3>Zamówienie {dataItem.number}</h3>
      <RecordFields data={dataItem} excludedFields={summaryFields} />
    </section>
  );
}

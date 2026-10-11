import type { GridColumn } from "@/shared/components/GridWrapper/GridWrapper.types";
import type { Order } from "./types/order.types";
import { createDropdownFilter } from "@/shared/components/GridWrapper/DropdownFilterCell/createDropdownFilter";

export const columns: GridColumn<Order>[] = [
  {
    field: "number",
    title: "Numer zamówienia",
    filter: "text",
  },
  {
    field: "status",
    title: "Status",
    filterCell: createDropdownFilter([
      "pending",
      "paid",
      "cancelled",
      "shipped",
    ]),
  },
  {
    field: "total",
    title: "Kwota",
    filter: "numeric",
  },
  {
    field: "currency",
    title: "Waluta",
    filter: "text",
  },
];

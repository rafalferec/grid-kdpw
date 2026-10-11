import type { GridColumn } from "@/shared/components/GridWrapper/GridWrapper.types";
import type { Order } from "./types/order.types";
import { createDropdownFilter } from "@/shared/components/GridWrapper/DropdownFilterCell/createDropdownFilter";

export const columns: GridColumn<Order>[] = [
  {
    field: "number",
    title: "Numer zamówienia",
    filter: true,
  },
  {
    field: "status",
    title: "Status",
    filter: true,
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
    filter: true,
    filterType: "numeric",
  },
  {
    field: "currency",
    title: "Waluta",
    filter: true,
  },
];

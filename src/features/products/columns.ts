import type { GridColumn } from "@/shared/components/GridWrapper/GridWrapper.types";

import type { Product } from "./types/product.types";
import { createDropdownFilter } from "@/shared/components/GridWrapper/DropdownFilterCell/createDropdownFilter";

export const columns: GridColumn<Product>[] = [
  {
    field: "id",
    title: "ID",
    width: 90,
  },
  {
    field: "name",
    title: "Nazwa produktu",
    filter: true,
  },
  {
    field: "sku",
    title: "SKU",
    width: 140,
    filter: true
  },
  {
    field: "price",
    title: "Cena",
    width: 220,
    filter: true,
  },
  {
    field: "brand",
    title: "Marka",
    width: 160,
    filter: true
  },
  {
    field: "in_stock",
    title: "Dostępność",
    width: 160,
    filter: true,
    filterCell: createDropdownFilter([
      "true",
      "false",
    ]),
  },
  {
    field: "rating",
    title: "Ocena",
    width: 120,
    filter: true
  },
];

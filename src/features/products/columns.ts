import type { GridColumn } from "@/shared/components/GridWrapper/GridWrapper.types";

import type { Product } from "./types/product.types";

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
  },
  {
    field: "price",
    title: "Cena",
    width: 220,
    filter: true,
    filterType: "range",
  },
  {
    field: "brand",
    title: "Marka",
    width: 160,
  },
  {
    field: "in_stock",
    title: "Dostępność",
    width: 160,
  },
  {
    field: "rating",
    title: "Ocena",
    width: 120,
  },
];

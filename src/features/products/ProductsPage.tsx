import { useState } from "react";
import type { CompositeFilterDescriptor } from "@progress/kendo-data-query";

import { GridWrapper } from "@/shared/components/GridWrapper/GridWrapper";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { buildLikeFilters } from "@/shared/api/buildLikeFilters";

import { useGetProductsQuery } from "./api/productsApi";
import type { Product } from "./types/product.types";
import { columns } from "./columns";
import { RecordDetails } from "@/shared/components/RecordDetails/RecordDetails";

const initialFilter: CompositeFilterDescriptor = { logic: "and", filters: [] };

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [filter, setFilter] = useState(initialFilter);
  const debouncedFilter = useDebounce(filter, 400);
  const isFilterPending = filter !== debouncedFilter;

  const excludedFields = columns.map((column) => column.field);

  const { currentData, isLoading, isFetching, isError, refetch } =
    useGetProductsQuery(
      {
        page,
        limit: pageSize,
        ...buildLikeFilters<Product>(debouncedFilter, columns),
      },
      { skip: isFilterPending },
    );

  const handleFilterChange = (nextFilter: CompositeFilterDescriptor) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setPage(1);
      return;
    }

    setPage(nextPage);
  };

  if (isError) {
    return (
      <section>
        <h1>Produkty</h1>

        <p role="alert">Nie udało się pobrać produktów.</p>

        <button type="button" onClick={() => refetch()}>
          Spróbuj ponownie
        </button>
      </section>
    );
  }

  return (
    <section>
      <h1>Produkty</h1>
      <GridWrapper<Product>
        data={currentData?.data ?? []}
        columns={columns}
        dataItemKey="id"
        selectedId={selectedId}
        onSelectionChange={setSelectedId}
        loading={isLoading || isFetching || isFilterPending}
        filter={filter}
        onFilterChange={handleFilterChange}
        onRefresh={refetch}
        pagination={{
          page,
          pageSize,
          total: currentData?.meta.total ?? 0,
          onPageChange: handlePageChange,
        }}
        detail={(props) => (
          <RecordDetails
            dataItem={props.dataItem}
            title={`Produkt ${props.dataItem.id}`}
            excludedFields={excludedFields}
          />
        )}
      />
    </section>
  );
}

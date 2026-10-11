import { useState } from "react";
import type { CompositeFilterDescriptor } from "@progress/kendo-data-query";

import { GridWrapper } from "@/shared/components/GridWrapper/GridWrapper";
import { useDebounce } from "@/shared/hooks/useDebounce";

import { useGetProductsQuery } from "./api/productsApi";
import type { Product } from "./types/product.types";
import { columns } from "./columns";
import { buildProductsFilters } from "./api/buildProductsFilters";

const initialFilter: CompositeFilterDescriptor = { logic: "and", filters: [] };

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState(initialFilter);
  const debouncedFilter = useDebounce(filter, 400);
  const isFilterPending = filter !== debouncedFilter;

  const { currentData, isLoading, isFetching, isError, refetch } =
    useGetProductsQuery({
      page,
      limit: pageSize,
      ...buildProductsFilters(debouncedFilter),
    }, { skip: isFilterPending });

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
        <h1>Products</h1>

        <p role="alert">Nie udało się pobrać produktów.</p>

        <button type="button" onClick={() => refetch()}>
          Spróbuj ponownie
        </button>
      </section>
    );
  }

  return (
    <section>
      <h1>Products</h1>
      <GridWrapper<Product>
        data={currentData?.data ?? []}
        columns={columns}
        dataItemKey="id"
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
      />
    </section>
  );
}

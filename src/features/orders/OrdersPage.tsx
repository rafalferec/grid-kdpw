import { useState } from "react";

import type { CompositeFilterDescriptor } from "@progress/kendo-data-query";

import { GridWrapper } from "@/shared/components/GridWrapper/GridWrapper";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { buildLikeFilters } from "@/shared/api/buildLikeFilters";

import { useGetOrdersQuery } from "./api/ordersApi";
import type { Order } from "./types/order.types";
import { columns } from "./columns";
import { RecordDetails } from "@/shared/components/RecordDetails/RecordDetails";

const initialFilter: CompositeFilterDescriptor = {
  logic: "and",
  filters: [],
};

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [filter, setFilter] = useState(initialFilter);

  const debouncedFilter = useDebounce(filter, 400);
  const isFilterPending = filter !== debouncedFilter;

  const { currentData, isLoading, isFetching, isError, refetch } =
    useGetOrdersQuery(
      {
        page,
        limit: pageSize,
        ...buildLikeFilters<Order>(debouncedFilter, columns),
      },
      { skip: isFilterPending },
    );

  const excludedFields = columns.map((column) => column.field);

  const getRowClassName = (order: Order): string => {
    switch (order.status) {
      case "paid":
      case "shipped":
        return "rowSuccess";
      case "cancelled":
        return "rowDanger";
      default:
        return "";
    }
  };

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setPage(1);
      return;
    }

    setPage(nextPage);
  };

  const handleFilterChange = (nextFilter: CompositeFilterDescriptor) => {
    setFilter(nextFilter);
    setPage(1);
  };

  if (isError) {
    return (
      <section>
        <h1>Orders</h1>

        <p role="alert">Nie udało się pobrać zamówień.</p>

        <button type="button" onClick={() => refetch()}>
          Spróbuj ponownie
        </button>
      </section>
    );
  }

  return (
    <section>
      <h1>Orders</h1>
      <GridWrapper<Order>
        data={currentData?.data ?? []}
        columns={columns}
        loading={isLoading || isFetching || isFilterPending}
        pagination={{
          page,
          pageSize,
          total: currentData?.meta.total ?? 0,
          onPageChange: handlePageChange,
        }}
        filter={filter}
        onFilterChange={handleFilterChange}
        dataItemKey="id"
        selectedId={selectedId}
        onSelectionChange={setSelectedId}
        detail={(props) => (
          <RecordDetails
            dataItem={props.dataItem}
            title={`Produkt ${props.dataItem.id}`}
            excludedFields={excludedFields}
          />
        )}
        onRefresh={refetch}
        rowClassName={getRowClassName}
      />
    </section>
  );
}

import { useState } from "react";

import type {
  CompositeFilterDescriptor,
  FilterDescriptor,
} from "@progress/kendo-data-query";

import { GridWrapper } from "@/shared/components/GridWrapper/GridWrapper";
import { useDebounce } from "@/shared/hooks/useDebounce";

import { useGetOrdersQuery } from "./api/ordersApi";
import type { Order } from "./types/order.types";
import { columns } from "./columns";
import { OrderDetails } from "./OrderDetails";

const initialFilter: CompositeFilterDescriptor = {
  logic: "and",
  filters: [],
};

function getFilterValue(
  filter: CompositeFilterDescriptor | null,
  field: string,
): string {
  if (!filter) return "";

  const descriptor = filter.filters.find(
    (item): item is FilterDescriptor => "field" in item && item.field === field,
  );

  return descriptor?.value == null ? "" : String(descriptor.value);
}

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [filter, setFilter] = useState(initialFilter);

  const debouncedFilter = useDebounce(filter, 400);

  const number = getFilterValue(debouncedFilter, "number");
  const status = getFilterValue(debouncedFilter, "status");
  const total = getFilterValue(debouncedFilter, "total");
  const currency = getFilterValue(debouncedFilter, "currency");

  const { currentData, isLoading, isFetching, isError, refetch } =
    useGetOrdersQuery({
      page,
      limit: pageSize,
      ...(number && { number_like: number }),
      ...(status && { status_like: status }),
      ...(currency && { currency }),
      ...(total.trim() !== "" &&
        Number.isFinite(Number(total)) && {
          total_like: Number(total),
        }),
    });

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
        loading={isLoading || isFetching || filter !== debouncedFilter}
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
        detail={OrderDetails}
        onRefresh={refetch}
        rowClassName={getRowClassName}
      />
    </section>
  );
}

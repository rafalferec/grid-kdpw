import { useId, useState } from "react";
import {
  Grid,
  GridColumn as KendoGridColumn,
} from "@progress/kendo-react-grid";

import type {
  GridPageChangeEvent,
  GridFilterChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";

import { LoadingOverlay } from "@/shared/components/LoadingOverlay/LoadingOverlay";

import type { GridWrapperProps } from "./GridWrapper.types";
import styles from "./GridWrapper.module.css";

import { GridSelectedDetails } from "./GridSelectedDetails";
import { GridRowActions, GridRowActionCell } from "./GridRowActions";

export function GridWrapper<T>({
  data,
  columns,
  message = "Ładowanie danych",
  loading = false,
  pagination,
  detail,
  filter,
  onFilterChange,
  dataItemKey,
  selectedId,
  onSelectionChange,
  onRefresh,
}: GridWrapperProps<T>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [displayedId, setDisplayedId] = useState<string | number | null>(null);
  const detailsId = useId();
  const displayedItem = data.find((item) => item[dataItemKey] === displayedId);

  const handleShowSelected = (id: string | number) => {
    onSelectionChange?.(id);
    setDisplayedId((currentId) => currentId === id ? null : id);
  };
  const handlePageChange = (event: GridPageChangeEvent) => {
    const { skip, take } = event.page;
    pagination.onPageChange(Math.floor(skip / take) + 1, take);
  };

  const handleFilterChange = (event: GridFilterChangeEvent) => {
    onFilterChange?.(event.filter);
  };

  const handleSelectionChange = (event: GridSelectionChangeEvent) => {
    const selectedKey = Object.keys(event.select).find(
      (key) => event.select[key],
    );

    const selectedItem = data.find(
      (item) => String(item[dataItemKey]) === selectedKey,
    );

    const id: unknown = selectedItem?.[dataItemKey];

    if (typeof id === "string" || typeof id === "number") {
      onSelectionChange?.(id);
    }
  };

  const detailExpand = expandedId == null ? {} : { [expandedId]: true };

  return (
    <div className={styles.wrapper} aria-busy={loading}>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onRefresh}
          disabled={loading || !onRefresh}
        >
          Refresh
        </button>
      </div>

      {displayedItem && <GridSelectedDetails data={displayedItem} id={detailsId} />}
      <GridRowActions
        dataItemKey={dataItemKey}
        displayedId={displayedItem != null ? displayedId : null}
        detailsId={detailsId}
        loading={loading}
        onToggle={handleShowSelected}
      >
        <Grid
          data={data}
          dataItemKey={dataItemKey}
          selectable={{
            enabled: Boolean(onSelectionChange),
            mode: "single",
          }}
          select={selectedId == null ? {} : { [String(selectedId)]: true }}
          onSelectionChange={handleSelectionChange}
          filterable={Boolean(onFilterChange)}
          {...(filter !== undefined ? { filter } : {})}
          onFilterChange={handleFilterChange}
          pageable={{
            type: "numeric",
            buttonCount: 10,
            previousNext: true,
            info: false,
            pageSizes: false,
            responsive: false,
          }}
          skip={(pagination.page - 1) * pagination.pageSize}
          take={pagination.pageSize}
          total={pagination.total}
          onPageChange={handlePageChange}
          {...(detail ? { detail } : {})}
          detailExpand={detailExpand}
          onDetailExpandChange={(event) => {
            const expandedKey = Object.keys(event.detailExpand).find(
              (key) => event.detailExpand[key] && key !== expandedId,
            );
            setExpandedId(expandedKey ?? null);
          }}
          showLoader={loading}
          loader={<LoadingOverlay message={message} />}
        >
          {columns.map((column) => (
            <KendoGridColumn
              key={column.field}
              field={column.field}
              title={column.title}
              {...(column.width !== undefined ? { width: column.width } : {})}
              filter={column.filter ?? "text"}
              filterable={column.filterable ?? true}
              {...(column.filterCell
                ? { cells: { filterCell: column.filterCell } }
                : {})}
            />
          ))}
          <KendoGridColumn
            title="Wyświetl dane"
            filterable={false}
            sortable={false}
            cells={{ data: GridRowActionCell }}
          />
        </Grid>
      </GridRowActions>
    </div>
  );
}

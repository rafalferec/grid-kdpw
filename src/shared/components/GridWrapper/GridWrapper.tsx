import { createContext, useContext, useId, useState } from "react";
import {
  Grid,
  GridColumn as KendoGridColumn,
} from "@progress/kendo-react-grid";

import type {
  GridPageChangeEvent,
  GridFilterChangeEvent,
  GridSelectionChangeEvent,
  GridCustomRowProps,
} from "@progress/kendo-react-grid";

import { LoadingOverlay } from "@/shared/components/LoadingOverlay/LoadingOverlay";

import type { GridWrapperProps } from "./GridWrapper.types";
import styles from "./GridWrapper.module.css";

import { GridSelectedDetails } from "./GridSelectedDetails";
import { TextFilterCell } from "./TextFilterCell";

const GridRowStyleContext = createContext<(item: unknown) => string | undefined>(() => undefined);

function GridDataRow({ trProps, dataItem, children }: GridCustomRowProps) {
  const getClassName = useContext(GridRowStyleContext);
  return (
    <tr {...trProps} className={[trProps?.className, getClassName(dataItem)].filter(Boolean).join(" ")}>
      {children}
    </tr>
  );
}

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
  rowClassName,
}: GridWrapperProps<T>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [displayedId, setDisplayedId] = useState<string | number | null>(null);
  const detailsId = useId();

  const selectedItem = selectedId == null
    ? undefined
    : data.find((item) => item[dataItemKey] === selectedId);

  const displayedItem = displayedId === null
    ? undefined
    : data.find((item) => item[dataItemKey] === displayedId);

  const getRowClassName = (dataItem: unknown) => {
    const item = data.find((record) => record === dataItem);
    return item !== undefined ? rowClassName?.(item) : undefined;
  };

  const handleShowSelected = () => {
    if (loading || selectedItem === undefined) return;
    setDisplayedId(selectedId ?? null);
  };

  const handlePageChange = (event: GridPageChangeEvent) => {
    const { skip, take } = event.page;
    pagination.onPageChange(Math.floor(skip / take) + 1, take);
  };

  const handleFilterChange = (event: GridFilterChangeEvent) => {
    onFilterChange?.(event.filter);
  };

  const handleSelectionChange = (event: GridSelectionChangeEvent) => {
    if (loading) return;

    const selectedKey = Object.keys(event.select).find(
      (key) => event.select[key] === true,
    );

    if (selectedKey === undefined) {
      onSelectionChange?.(null);
      return;
    }

    const nextSelectedItem = data.find(
      (item) => String(item[dataItemKey]) === selectedKey,
    );

    const id: unknown = nextSelectedItem?.[dataItemKey];

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
          onClick={handleShowSelected}
          disabled={loading || selectedItem === undefined}
          aria-controls={displayedItem !== undefined ? detailsId : undefined}
        >
          Wyświetl zaznaczony
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onRefresh}
          disabled={loading || !onRefresh}
        >
          Refresh
        </button>
      </div>

      {displayedItem && <GridSelectedDetails data={displayedItem} id={detailsId}  onClose={() => setDisplayedId(null)} />}
      <GridRowStyleContext value={getRowClassName}>
        <Grid
          data={data}
          rows={{ data: GridDataRow }}
          dataItemKey={dataItemKey}
          navigatable
          selectable={{
            enabled: Boolean(onSelectionChange),
            mode: "single",
            cell: false,
            drag: false,
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
              filter="text"
              filterable={column.filter === true}
              {...(column.filter === true
                ? { cells: { filterCell: column.filterCell ?? TextFilterCell } }
                : {})}
            />
          ))}
        </Grid>
      </GridRowStyleContext>
    </div>
  );
}

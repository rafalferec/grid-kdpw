import { createContext, useCallback, useContext, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
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

import { GridSelectedDetails } from "./details/GridSelectedDetails";
import { TextFilterCell } from "./filters/TextFilterCell";

const GridRowStyleContext = createContext<(dataIndex: number) => string | undefined>(() => undefined);
const DEFAULT_COLUMN_MIN_WIDTH = 200;
const DETAIL_COLUMN_WIDTH = 32;

function GridDataRow({ trProps, dataIndex, children }: GridCustomRowProps) {
  const getClassName = useContext(GridRowStyleContext);
  return (
    <tr {...trProps} className={[trProps?.className, getClassName(dataIndex)].filter(Boolean).join(" ")}>
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
  const [loaderContainer, setLoaderContainer] = useState<HTMLElement | null>(null);
  const detailsId = useId();
  const showSelectedButtonRef = useRef<HTMLButtonElement>(null);

  const setWrapperRef = useCallback((element: HTMLDivElement | null) => {
    setLoaderContainer(element?.querySelector<HTMLElement>(".k-grid-container") ?? null);
  }, []);

  const selectedItem = selectedId == null
    ? undefined
    : data.find((item) => item[dataItemKey] === selectedId);

  const displayedItem = displayedId === null
    ? undefined
    : data.find((item) => item[dataItemKey] === displayedId);

  const getRowClassName = (dataIndex: number) => {
    const item = data[dataIndex];
    return item !== undefined ? rowClassName?.(item) : undefined;
  };

  const handleShowSelected = () => {
    if (loading || selectedItem === undefined) return;
    setDisplayedId(selectedId ?? null);
  };

  const handleCloseDetails = () => {
    setDisplayedId(null);
    showSelectedButtonRef.current?.focus();
  };

  const handlePageChange = (event: GridPageChangeEvent) => {
    const { skip, take } = event.page;
    pagination.onPageChange(Math.floor(skip / take) + 1, take);
  };

  const handleFilterChange = (event: GridFilterChangeEvent) => {
    onFilterChange?.(event.filter ?? { logic: "and", filters: [] });
  };

  const handleSelectionChange = (event: GridSelectionChangeEvent) => {
    if (loading) return;

    const selectedKey = Object.keys(event.select).find(
      (key) => event.select[key] === true,
    );

    if (selectedKey === undefined) {
      setDisplayedId(null);
      onSelectionChange?.(null);
      return;
    }

    const nextSelectedItem = data.find(
      (item) => String(item[dataItemKey]) === selectedKey,
    );

    const id: unknown = nextSelectedItem?.[dataItemKey];

    if (typeof id === "string" || typeof id === "number") {
      if (id !== selectedId) setDisplayedId(null);
      onSelectionChange?.(id);
    }
  };

  const detailExpand = expandedId == null ? {} : { [expandedId]: true };
  // Chroni kolumny bez width przed ściśnięciem; nie przypisuje im stałej szerokości.
  const tableMinWidth = columns.reduce(
    (width, column) => width + (column.width ?? DEFAULT_COLUMN_MIN_WIDTH),
    detail ? DETAIL_COLUMN_WIDTH : 0,
  );
  const gridStyle: CSSProperties & { "--grid-table-min-width": string } = {
    "--grid-table-min-width": `${tableMinWidth}px`,
  };

  return (
    <div ref={setWrapperRef} className={styles.wrapper} aria-busy={loading}>
      <div className={styles.actions}>
        <button
          ref={showSelectedButtonRef}
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

      {displayedItem && (
        <GridSelectedDetails
          data={displayedItem}
          id={detailsId}
          onClose={handleCloseDetails}
        />
      )}
      <GridRowStyleContext value={getRowClassName}>
        <Grid
          style={gridStyle}
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
            responsive: true,
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
          loader={loaderContainer
            ? createPortal(<LoadingOverlay message={message} />, loaderContainer)
            : null}
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

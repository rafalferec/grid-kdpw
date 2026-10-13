import type { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import type { GridCustomFilterCellProps, GridProps } from '@progress/kendo-react-grid';
import type { ComponentType } from 'react';

export interface GridColumn<T> {
  field: keyof T & string;
  title: string;
  width?: number;
  filter?: boolean;
  filterCell?: ComponentType<GridCustomFilterCellProps>;
}

export interface GridPagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export interface GridWrapperProps<T> {
  data: T[];
  columns: GridColumn<T>[];
  message?: string; 
  loading?: boolean;
  pagination: GridPagination;
  filter?: CompositeFilterDescriptor;
  onFilterChange?: (filter: CompositeFilterDescriptor) => void;
  dataItemKey: keyof T & string;
  selectedId?: string | number | null;
  onSelectionChange?: (id: string | number | null) => void;
  detail?: GridProps["detail"];
  onRefresh?: () => void;
  rowClassName?: (item: T) => string;
}

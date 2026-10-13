import type { CompositeFilterDescriptor } from '@progress/kendo-data-query';

import type { GridColumn } from '@/shared/components/GridWrapper/GridWrapper.types';
import { findFilter } from '@/shared/components/GridWrapper/filters/filterDescriptors';
import type { LikeFilters } from './api.types';

export function buildLikeFilters<T>(
  filter: CompositeFilterDescriptor | null | undefined,
  columns: readonly Pick<GridColumn<T>, 'field' | 'filter'>[],
): LikeFilters<T> {
  const params: LikeFilters<T> = {};

  for (const column of columns) {
    if (column.filter !== true) continue;

    const value: unknown = findFilter(filter, column.field, 'contains')?.value;
    if (typeof value !== 'string') continue;

    const normalizedValue = value.trim();
    if (normalizedValue === '') continue;

    const key: `${keyof T & string}_like` = `${column.field}_like`;
    params[key] = normalizedValue;
  }

  return params;
}

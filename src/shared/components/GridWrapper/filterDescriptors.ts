import type { CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';

export function findFilter(
  filter: CompositeFilterDescriptor,
  field: string,
  operator: string,
): FilterDescriptor | undefined {
  for (const item of filter.filters) {
    if ('filters' in item) {
      const descriptor = findFilter(item, field, operator);
      if (descriptor) return descriptor;
    } else if (item.field === field && item.operator === operator) {
      return item;
    }
  }
  return undefined;
}

function removeFilter(
  filter: CompositeFilterDescriptor,
  field: string,
  operator: string,
): CompositeFilterDescriptor {
  const filters: CompositeFilterDescriptor['filters'] = [];
  for (const item of filter.filters) {
    if ('filters' in item) {
      const group = removeFilter(item, field, operator);
      if (group.filters.length > 0) filters.push(group);
    } else if (item.field !== field || item.operator !== operator) {
      filters.push(item);
    }
  }
  return { ...filter, filters };
}

export function updateRangeFilter(
  filter: CompositeFilterDescriptor,
  field: string,
  operator: 'gte' | 'lte',
  value: number | null,
): CompositeFilterDescriptor {
  const nextFilter = removeFilter(filter, field, operator);
  if (value !== null && Number.isFinite(value)) {
    nextFilter.filters.push({ field, operator, value });
  }
  return nextFilter;
}

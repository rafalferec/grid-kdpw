import type { CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';

export function findFilter(
  filter: CompositeFilterDescriptor | null | undefined,
  field: string,
  operator: string,
): FilterDescriptor | undefined {
  if (filter == null) return undefined;

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

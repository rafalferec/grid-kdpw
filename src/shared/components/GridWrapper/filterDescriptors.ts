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

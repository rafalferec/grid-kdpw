import type { CompositeFilterDescriptor } from '@progress/kendo-data-query';

import { findFilter } from '@/shared/components/GridWrapper/filterDescriptors';
import type { ProductsQueryParams } from '../types/product.types';

export function buildProductsFilters(
  filter: CompositeFilterDescriptor,
): Omit<ProductsQueryParams, 'page' | 'limit'> {
  const name: unknown = findFilter(filter, 'name', 'contains')?.value;
  const minimumPrice: unknown = findFilter(filter, 'price', 'gte')?.value;
  const maximumPrice: unknown = findFilter(filter, 'price', 'lte')?.value;

  return {
    ...(typeof name === 'string' && name.trim() !== '' && { name_like: name.trim() }),
    ...(typeof minimumPrice === 'number' && Number.isFinite(minimumPrice)
      && { price_gte: minimumPrice }),
    ...(typeof maximumPrice === 'number' && Number.isFinite(maximumPrice)
      && { price_lte: maximumPrice }),
  };
}

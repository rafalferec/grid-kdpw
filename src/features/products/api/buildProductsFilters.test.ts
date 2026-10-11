import { expect, test } from 'vitest';

import { buildProductsFilters } from './buildProductsFilters';

test('pomija puste i niepoprawne wartości, zachowuje zero i mapuje zagnieżdżone filtry', () => {
  expect(buildProductsFilters({ logic: 'and', filters: [
    { field: 'name', operator: 'contains', value: '  ' },
    { field: 'price', operator: 'gte', value: Number.NaN },
    { field: 'price', operator: 'lte', value: '100' },
  ] })).toEqual({});
  expect(buildProductsFilters({ logic: 'and', filters: [
    { logic: 'and', filters: [
      { field: 'name', operator: 'contains', value: ' Sonora ' },
      { field: 'price', operator: 'gte', value: 0 },
      { field: 'price', operator: 'lte', value: 199.99 },
    ] },
  ] })).toEqual({ name_like: 'Sonora', price_gte: 0, price_lte: 199.99 });
});

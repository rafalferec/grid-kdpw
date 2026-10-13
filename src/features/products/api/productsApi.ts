import { baseApi } from '@/shared/api/baseApi';
import type { ApiResponse } from '@/shared/api/api.types';
import type { Product, ProductsQueryParams } from '../types/product.types';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiResponse<Product>, ProductsQueryParams>({
      query: (params) => ({
        url: 'products',
        params,
      }),
    }),
  }),
});

export const { useGetProductsQuery } = productsApi;
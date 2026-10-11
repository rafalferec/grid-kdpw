import { baseApi } from '@/shared/api/baseApi';
import type { ApiResponse } from '@/shared/api/api.types';
import type { Order, OrdersQueryParams } from '../types/order.types';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<ApiResponse<Order>, OrdersQueryParams>({
      query: (params) => ({
        url: 'orders',
        params,
      }),
    }),
  }),
});

export const { useGetOrdersQuery } = ordersApi;
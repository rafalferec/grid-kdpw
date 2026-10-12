export interface Order {
  id: number;
  created_at: string;
  updated_at: string;
  number: string;
  customer_id: number;
  status: 'pending' | 'paid' | 'cancelled' | 'shipped';
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  payment_method: string;
  shipping_address: string;
  shipping_method: string;
  tracking_number: string | null;
  placed_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
}

export type OrdersQueryParams = ApiPaginationParams & LikeFilters<Order>;
import type { ApiPaginationParams, LikeFilters } from '@/shared/api/api.types';

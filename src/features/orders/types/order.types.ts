import type {
  ApiPaginationParams,
  LikeFilters,
} from '@/shared/api/api.types';

export interface ShippingAddress {
  line1: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'shipped';

export interface Order {
  id: number;
  number: string;
  customer_id: number;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  payment_method: string;
  paid_at: string | null;
  shipping_address: ShippingAddress;
  shipping_method: string;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  placed_at: string;
  notes: string | null;
}

export type OrdersQueryParams =
  ApiPaginationParams & LikeFilters<Order>;

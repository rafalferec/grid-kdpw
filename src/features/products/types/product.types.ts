import type {
  ApiPaginationParams,
  LikeFilters,
} from '@/shared/api/api.types';

export const PRODUCT_STATUSES = ['active', 'inactive', 'archived'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: number;
  brand: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  color: string;
  weight_g: number;
  tags: string[];
  in_stock: boolean;
  rating: number;
  review_count: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export type ProductsQueryParams =
  ApiPaginationParams & LikeFilters<Product>;
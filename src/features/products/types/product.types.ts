import type { ApiPaginationParams, LikeFilters } from '@/shared/api/api.types';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  category_id: number;
  in_stock: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
  brand: string;
}

export type ProductsQueryParams = ApiPaginationParams & LikeFilters<Product>;

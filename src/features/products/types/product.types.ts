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

export interface ProductsQueryParams {
  page: number;
  limit: number;
  name_like?: string;
  category_id?: number;
  price_gte?: number;
  price_lte?: number;
}

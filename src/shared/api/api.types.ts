export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiPaginationParams {
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
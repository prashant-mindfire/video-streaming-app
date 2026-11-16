export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  videos: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

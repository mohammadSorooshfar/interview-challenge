export interface PostProductsResponse {
  id: string;
  name: string;
  slug: string;
  available: boolean;
  categoryId: number;
  categoryName: string;
  minPrice: number;
  maxPrice: number;
  imageUrl: string;
  azkivam: boolean;
  hidden: boolean;
  merchantName: string;
  merchantId: number;
}

export interface PostProductsRequest {
  merchantIds: number[];
}

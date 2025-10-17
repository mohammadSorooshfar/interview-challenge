export interface GetCategoriesResponse {
  id: number;
  name: string;
  slug: string;
  enabled: boolean;
  priority: number;
  mapped: boolean;
  parent: number | null;
}

export interface GetMerchantsResponse {
  id: number;
  name: string;
  enabled: boolean | null;
  description: string | null;
}

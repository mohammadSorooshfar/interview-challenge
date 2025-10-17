export interface ICategories {
  id: number;
  name: string;
  slug: string;
  enabled: boolean;
  priority: number;
  mapped: boolean;
  parent: number | null;
  children: ICategories[];
}

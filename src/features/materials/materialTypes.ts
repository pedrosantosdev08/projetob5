export interface Material {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  active: boolean;
  createdAt: Date;
}

export type MaterialPageCursor = unknown;

export interface MaterialPageResult {
  items: Material[];
  nextCursor: MaterialPageCursor | null;
  hasMore: boolean;
}

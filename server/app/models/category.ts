export interface Category {
  id: number;
  category: string;
  created_at: Date;
}

export type NewCategory = Omit<Category, 'id' | 'created_at'>;

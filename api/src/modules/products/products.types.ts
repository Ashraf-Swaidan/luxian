import { Category, Product, ProductImage } from '@prisma/client';

export type ProductWithCategory = Omit<Product, 'cost'> & {
  category: Category;
  images?: ProductImage[];
  cost?: Product['cost'];
};

export type PaginatedProducts = {
  data: ProductWithCategory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

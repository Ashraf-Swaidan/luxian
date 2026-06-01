import { Category, Product, ProductImage } from '@prisma/client';

export type ProductWithCategory = Product & {
  category: Category;
  images?: ProductImage[];
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

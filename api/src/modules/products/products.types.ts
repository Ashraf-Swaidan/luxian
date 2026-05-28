import { Product, Category } from '@prisma/client';

export type ProductWithCategory = Product & { category: Category };

export type PaginatedProducts = {
  data: ProductWithCategory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  FASHION_CATEGORIES,
  FASHION_PRODUCTS,
} from './data/fashion-catalog';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function seedFashionCatalog(client: PrismaClient = prisma) {
  const categoryIds = new Map<string, string>();

  for (const category of FASHION_CATEGORIES) {
    const row = await client.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });
    categoryIds.set(category.slug, row.id);
  }

  for (const product of FASHION_PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${product.categorySlug}`);
    }

    await client.product.upsert({
      where: { sku: product.sku },
      update: {
        stock: product.stock,
        price: product.price,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl ?? null,
        categoryId,
        isActive: true,
      },
      create: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId,
      },
    });
  }

  return {
    categories: FASHION_CATEGORIES.length,
    products: FASHION_PRODUCTS.length,
  };
}

async function main() {
  const result = await seedFashionCatalog();
  console.log('Luxian fashion seed complete.');
  console.log(
    `  ${result.categories} categories, ${result.products} products (upserted by slug/SKU).`,
  );
  console.log('  Existing users and other products were not removed.');
}

main()
  .catch((error) => {
    console.error('Fashion seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

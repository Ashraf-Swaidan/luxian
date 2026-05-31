import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  MOVEMENT_COLLECTION,
  MOVEMENT_PRODUCTS,
} from './data/movement-collection';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function seedMovementCollection(client: PrismaClient = prisma) {
  const categoryIds = new Map<string, string>();

  for (const categorySlug of new Set(
    MOVEMENT_PRODUCTS.map((product) => product.categorySlug),
  )) {
    const category = await client.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    if (!category) {
      throw new Error(
        `Missing category "${categorySlug}". Run the fashion seed first or create the category in admin.`,
      );
    }

    categoryIds.set(categorySlug, category.id);
  }

  const productIds = new Map<string, string>();

  for (const product of MOVEMENT_PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${product.categorySlug}`);
    }

    const row = await client.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId,
        imageUrl: null,
        isActive: true,
      },
      create: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId,
        imageUrl: null,
      },
    });

    productIds.set(product.sku, row.id);
  }

  const collection = await client.collection.upsert({
    where: { slug: MOVEMENT_COLLECTION.slug },
    update: {
      name: MOVEMENT_COLLECTION.name,
      description: MOVEMENT_COLLECTION.description,
      imageUrl: null,
      isActive: true,
    },
    create: {
      slug: MOVEMENT_COLLECTION.slug,
      name: MOVEMENT_COLLECTION.name,
      description: MOVEMENT_COLLECTION.description,
      imageUrl: null,
    },
  });

  const orderedProductIds = MOVEMENT_COLLECTION.productSkus.map((sku) => {
    const productId = productIds.get(sku);
    if (!productId) {
      throw new Error(`Unknown product SKU for Movement collection: ${sku}`);
    }
    return productId;
  });

  await client.collectionProduct.deleteMany({
    where: {
      collectionId: collection.id,
      productId: { notIn: orderedProductIds },
    },
  });

  for (const [position, productId] of orderedProductIds.entries()) {
    await client.collectionProduct.upsert({
      where: {
        collectionId_productId: {
          collectionId: collection.id,
          productId,
        },
      },
      update: { position },
      create: {
        collectionId: collection.id,
        productId,
        position,
      },
    });
  }

  return {
    products: MOVEMENT_PRODUCTS.length,
    collection: MOVEMENT_COLLECTION.name,
  };
}

async function main() {
  const result = await seedMovementCollection();
  console.log('Movement seed complete.');
  console.log(
    `  ${result.products} products linked to "${result.collection}" with no seeded images.`,
  );
}

main()
  .catch((error) => {
    console.error('Movement seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

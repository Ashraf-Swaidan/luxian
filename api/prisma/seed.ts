import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const DEMO_PASSWORD = 'Secret1!';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      password: passwordHash,
      firstName: 'Shop',
      lastName: 'User',
      role: Role.USER,
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets and devices',
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel and accessories',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'PHONE-001' },
    update: { stock: 50 },
    create: {
      name: 'Demo Smartphone',
      sku: 'PHONE-001',
      description: 'Budget smartphone for testing checkout',
      price: 299.99,
      stock: 50,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'HEADPHONE-001' },
    update: { stock: 30 },
    create: {
      name: 'Wireless Headphones',
      sku: 'HEADPHONE-001',
      description: 'Over-ear headphones',
      price: 79.99,
      stock: 30,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'TSHIRT-001' },
    update: { stock: 100 },
    create: {
      name: 'Classic T-Shirt',
      sku: 'TSHIRT-001',
      description: 'Cotton tee',
      price: 19.99,
      stock: 100,
      categoryId: clothing.id,
    },
  });

  console.log('Seed complete.');
  console.log(`  Admin: admin@demo.com / ${DEMO_PASSWORD} (id: ${admin.id})`);
  console.log(`  User:  user@demo.com / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

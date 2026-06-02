"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const seed_fashion_1 = require("./seed-fashion");
const permission_registry_1 = require("../src/modules/auth/permissions/permission.registry");
const SALT_ROUNDS = 12;
const DEMO_PASSWORD = 'Secret1!';
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new client_1.PrismaClient({ adapter });
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
            role: client_1.Role.ADMIN,
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
            role: client_1.Role.USER,
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
    for (const preset of permission_registry_1.DEFAULT_STAFF_ROLE_PRESETS) {
        await prisma.staffRole.upsert({
            where: { slug: preset.slug },
            update: {
                name: preset.name,
                description: preset.description,
                isSystem: true,
            },
            create: {
                name: preset.name,
                slug: preset.slug,
                description: preset.description,
                isSystem: true,
                permissions: {
                    create: preset.permissions.map((permission) => ({ permission })),
                },
            },
        });
    }
    const fashion = await (0, seed_fashion_1.seedFashionCatalog)(prisma);
    console.log('Seed complete.');
    console.log(`  Admin: admin@demo.com / ${DEMO_PASSWORD} (id: ${admin.id})`);
    console.log(`  User:  user@demo.com / ${DEMO_PASSWORD}`);
    console.log(`  Fashion catalog: ${fashion.categories} categories, ${fashion.products} Luxian products`);
}
main()
    .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
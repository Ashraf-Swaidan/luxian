import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
export declare function seedFashionCatalog(client?: PrismaClient): Promise<{
    categories: number;
    products: number;
}>;

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
export declare function seedMovementCollection(client?: PrismaClient): Promise<{
    products: number;
    collection: string;
}>;

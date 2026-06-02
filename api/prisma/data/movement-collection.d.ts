export type MovementProductSeed = {
    sku: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
};
export declare const MOVEMENT_PRODUCTS: MovementProductSeed[];
export declare const MOVEMENT_COLLECTION: {
    slug: string;
    name: string;
    description: string;
    productSkus: string[];
};

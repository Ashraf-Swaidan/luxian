export type FashionCategorySeed = {
    slug: string;
    name: string;
    description: string;
};
export type FashionProductSeed = {
    sku: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
    imageUrl?: string;
};
export declare const FASHION_CATEGORIES: FashionCategorySeed[];
export declare const FASHION_PRODUCTS: FashionProductSeed[];

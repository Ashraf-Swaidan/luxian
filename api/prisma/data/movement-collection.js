"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOVEMENT_COLLECTION = exports.MOVEMENT_PRODUCTS = void 0;
exports.MOVEMENT_PRODUCTS = [
    {
        sku: 'LUX-RPS-001',
        name: 'Riviera Palm Resort Shirt',
        description: 'Lightweight resort shirt featuring bold tropical palm-inspired patterns designed for summer escapes, beach clubs, and elevated casual wear.',
        price: 69.0,
        stock: 44,
        categorySlug: 'luxian-tops',
    },
    {
        sku: 'LUX-CRS-002',
        name: 'Coastal Reef Printed Shirt',
        description: 'Soft neutral-toned resort shirt inspired by coral reefs and Mediterranean coastlines, blending effortless elegance with vacation comfort.',
        price: 74.0,
        stock: 38,
        categorySlug: 'luxian-tops',
    },
    {
        sku: 'LUX-SLS-003',
        name: 'Sage Linen Resort Shirt',
        description: 'Breathable linen shirt designed for warm-weather sophistication with a clean relaxed silhouette and timeless summer appeal.',
        price: 79.0,
        stock: 36,
        categorySlug: 'luxian-tops',
    },
    {
        sku: 'LUX-SMT-004',
        name: 'Sunset Mosaic Resort Top',
        description: 'Vibrant summer statement piece inspired by sunset colors, beach destinations, and contemporary luxury resort fashion.',
        price: 59.0,
        stock: 42,
        categorySlug: 'luxian-tops',
    },
    {
        sku: 'LUX-LBS-005',
        name: 'Lagoon Breeze Printed Shirt',
        description: 'Modern tropical shirt combining vibrant resort patterns with a refined silhouette for vacations, evenings, and summer events.',
        price: 72.0,
        stock: 40,
        categorySlug: 'luxian-tops',
    },
    {
        sku: 'LUX-RLS-006',
        name: 'Riviera Linen Wrap Set',
        description: 'Lightweight coordinated linen outfit designed for effortless elegance, coastal destinations, and sophisticated summer styling.',
        price: 89.0,
        stock: 30,
        categorySlug: 'luxian-bottoms',
    },
    {
        sku: 'LUX-PCS-007',
        name: 'Palm Club Sunglasses',
        description: 'Modern resort-inspired sunglasses designed to complete elevated summer looks with confidence and sophistication.',
        price: 49.0,
        stock: 54,
        categorySlug: 'luxian-eyewear',
    },
];
exports.MOVEMENT_COLLECTION = {
    slug: 'the-movement',
    name: 'The Movement',
    description: 'A Riviera-ready resort edit of printed shirts, linen silhouettes, and sharp summer eyewear.',
    productSkus: exports.MOVEMENT_PRODUCTS.map((product) => product.sku),
};
//# sourceMappingURL=movement-collection.js.map
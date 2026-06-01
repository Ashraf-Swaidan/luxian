import type { Product, VisitorEvent } from '@prisma/client';
import {
  DECAY_HALF_LIFE_DAYS,
  EVENT_WEIGHTS,
  MAX_CATEGORY_SHARE,
  type AffinityProfile,
} from './personalization.types';

export function decayFactor(eventDate: Date, now = new Date()): number {
  const ageMs = now.getTime() - eventDate.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, ageDays / DECAY_HALF_LIFE_DAYS);
}

export function buildAffinityProfile(
  events: VisitorEvent[],
  productCategoryById: Map<string, string>,
): AffinityProfile {
  const categoryScores = new Map<string, number>();
  const productScores = new Map<string, number>();
  const searchTerms: string[] = [];
  const now = new Date();

  const addCategory = (categoryId: string, delta: number) => {
    categoryScores.set(categoryId, (categoryScores.get(categoryId) ?? 0) + delta);
  };

  const addProduct = (productId: string, delta: number) => {
    productScores.set(productId, (productScores.get(productId) ?? 0) + delta);
    const categoryId = productCategoryById.get(productId);
    if (categoryId) {
      addCategory(categoryId, delta * 0.6);
    }
  };

  for (const event of events) {
    const baseWeight = EVENT_WEIGHTS[event.eventType];
    const weight = baseWeight * decayFactor(event.createdAt, now);

    switch (event.eventType) {
      case 'PRODUCT_VIEW':
      case 'PRODUCT_CLICK':
        if (event.productId) {
          addProduct(event.productId, weight);
        }
        break;
      case 'CATEGORY_FILTER':
        if (event.categoryId) {
          addCategory(event.categoryId, weight);
        }
        break;
      case 'COLLECTION_FILTER':
        break;
      case 'SEARCH':
        if (event.search?.trim()) {
          searchTerms.push(event.search.trim().toLowerCase());
        }
        break;
      default:
        break;
    }
  }

  return { categoryScores, productScores, searchTerms };
}

export function scoreProduct(
  product: Product & { category?: { name: string } | null },
  profile: AffinityProfile,
): number {
  let score = profile.productScores.get(product.id) ?? 0;
  score += profile.categoryScores.get(product.categoryId) ?? 0;

  if (profile.searchTerms.length > 0) {
    const haystack = [
      product.name,
      product.description ?? '',
      product.category?.name ?? '',
      product.sku,
    ]
      .join(' ')
      .toLowerCase();

    for (const term of profile.searchTerms) {
      if (haystack.includes(term)) {
        score += EVENT_WEIGHTS.SEARCH * 0.5;
      }
    }
  }

  return score;
}

/** Sort by affinity, then name; cap dominant category share on a page. */
export function rankProductsByAffinity<T extends Product & { category?: { name: string } | null }>(
  products: T[],
  profile: AffinityProfile,
  options?: { categoryFilterId?: string },
): T[] {
  if (
    profile.categoryScores.size === 0 &&
    profile.productScores.size === 0 &&
    profile.searchTerms.length === 0
  ) {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }

  const scored = products
    .map((product) => ({
      product,
      score: scoreProduct(product, profile),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.product.name.localeCompare(b.product.name);
    });

  if (options?.categoryFilterId) {
    return scored.map((row) => row.product);
  }

  const maxFromTopCategory = Math.max(
    1,
    Math.floor(products.length * MAX_CATEGORY_SHARE),
  );
  const categoryCounts = new Map<string, number>();
  const result: T[] = [];
  const deferred: T[] = [];

  for (const { product, score } of scored) {
    if (score <= 0) {
      deferred.push(product);
      continue;
    }

    const count = categoryCounts.get(product.categoryId) ?? 0;
    if (count >= maxFromTopCategory) {
      deferred.push(product);
      continue;
    }

    categoryCounts.set(product.categoryId, count + 1);
    result.push(product);
  }

  const tail = [...deferred].sort((a, b) => a.name.localeCompare(b.name));
  return [...result, ...tail];
}

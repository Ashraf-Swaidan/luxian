export type AffinityProfile = {
  categoryScores: Map<string, number>;
  productScores: Map<string, number>;
  searchTerms: string[];
};

export const EVENT_WEIGHTS = {
  PRODUCT_VIEW: 3,
  PRODUCT_CLICK: 4,
  CATEGORY_FILTER: 2,
  COLLECTION_FILTER: 1,
  SEARCH: 1,
} as const;

/** Events older than this are ignored. */
export const EVENT_LOOKBACK_DAYS = 30;

/** Half-life for recency decay (days). */
export const DECAY_HALF_LIFE_DAYS = 7;

/** Minimum affinity score for a product to appear in recommendations. */
export const MIN_RECOMMENDATION_SCORE = 0.5;

/** Minimum products required before showing the recommendations section. */
export const MIN_RECOMMENDATION_COUNT = 4;

/** Max share of one category on a personalized catalog page (0–1). */
export const MAX_CATEGORY_SHARE = 0.7;

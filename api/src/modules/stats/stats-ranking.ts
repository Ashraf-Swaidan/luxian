export type StatsRankBy =
  | 'balanced'
  | 'units'
  | 'revenue'
  | 'profit'
  | 'orders'
  | 'spent';

export type RankableMetrics = {
  unitsSold?: number;
  revenue?: number;
  profit?: number;
  orderCount?: number;
  totalSpent?: number;
};

const METRIC_KEYS: (keyof RankableMetrics)[] = [
  'unitsSold',
  'revenue',
  'profit',
  'orderCount',
  'totalSpent',
];

function activeMetrics(items: RankableMetrics[]): (keyof RankableMetrics)[] {
  return METRIC_KEYS.filter((key) => items.some((item) => (item[key] ?? 0) > 0));
}

function balancedScore(item: RankableMetrics, maxes: Record<string, number>, keys: (keyof RankableMetrics)[]) {
  if (keys.length === 0) {
    return 0;
  }
  const total = keys.reduce((sum, key) => sum + (item[key] ?? 0) / maxes[key], 0);
  return total / keys.length;
}

function compareByRank(a: RankableMetrics, b: RankableMetrics, rankBy: StatsRankBy, maxes: Record<string, number>, keys: (keyof RankableMetrics)[]) {
  switch (rankBy) {
    case 'units':
      return (a.unitsSold ?? 0) - (b.unitsSold ?? 0);
    case 'revenue':
      return (a.revenue ?? 0) - (b.revenue ?? 0);
    case 'profit':
      return (a.profit ?? 0) - (b.profit ?? 0);
    case 'orders':
      return (a.orderCount ?? 0) - (b.orderCount ?? 0);
    case 'spent':
      return (a.totalSpent ?? 0) - (b.totalSpent ?? 0);
    case 'balanced':
    default:
      return balancedScore(a, maxes, keys) - balancedScore(b, maxes, keys);
  }
}

export function rankItems<T extends RankableMetrics>(
  items: T[],
  rankBy: StatsRankBy = 'balanced',
  limit: number,
): T[] {
  if (items.length === 0) {
    return [];
  }

  const keys = activeMetrics(items);
  const maxes = Object.fromEntries(
    keys.map((key) => [key, Math.max(...items.map((item) => item[key] ?? 0), 1)]),
  ) as Record<string, number>;

  return [...items]
    .sort((a, b) => compareByRank(b, a, rankBy, maxes, keys))
    .slice(0, limit);
}

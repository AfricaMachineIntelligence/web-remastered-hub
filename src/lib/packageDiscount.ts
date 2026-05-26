// Multi-service "Build Your Own Beauty Package" discount logic.
// Applies to bundled beauty services booked together (excludes restaurant items).
//
// Tiers:
//   2 services  -> 10% off
//   3 services  -> 15% off
//   4+ services -> 20% off

export type DiscountTier = {
  count: number;
  percent: number;
  label: string;
};

export const DISCOUNT_TIERS: DiscountTier[] = [
  { count: 4, percent: 20, label: "20% OFF (4+ services)" },
  { count: 3, percent: 15, label: "15% OFF (3 services)" },
  { count: 2, percent: 10, label: "10% OFF (2 services)" },
];

export type DiscountableItem = {
  price: number;
  isRestaurant?: boolean;
};

export type DiscountResult = {
  eligibleCount: number;
  eligibleSubtotal: number;
  nonEligibleSubtotal: number;
  percent: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  appliedLabel: string | null;
  nextTier: DiscountTier | null; // suggest "add 1 more to unlock 15%"
};

export function calculatePackageDiscount(items: DiscountableItem[]): DiscountResult {
  const eligible = items.filter((i) => !i.isRestaurant);
  const nonEligible = items.filter((i) => i.isRestaurant);

  const eligibleCount = eligible.length;
  const eligibleSubtotal = eligible.reduce((s, i) => s + i.price, 0);
  const nonEligibleSubtotal = nonEligible.reduce((s, i) => s + i.price, 0);
  const subtotal = eligibleSubtotal + nonEligibleSubtotal;

  const tier = DISCOUNT_TIERS.find((t) => eligibleCount >= t.count) ?? null;
  const percent = tier?.percent ?? 0;
  const discountAmount = Math.round((eligibleSubtotal * percent) / 100);

  // Next tier suggestion (the smallest tier above current count)
  const nextTier =
    [...DISCOUNT_TIERS]
      .reverse()
      .find((t) => t.count > eligibleCount) ?? null;

  return {
    eligibleCount,
    eligibleSubtotal,
    nonEligibleSubtotal,
    percent,
    discountAmount,
    subtotal,
    total: subtotal - discountAmount,
    appliedLabel: tier?.label ?? null,
    nextTier,
  };
}

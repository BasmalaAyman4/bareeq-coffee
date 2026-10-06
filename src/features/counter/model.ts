import { type Product } from '@/types/catalog';
export type CounterLine = {
  key: string;
  product: Product;
  variantId: string | null;
  modifierIds: string[];
  quantity: number;
};
export const unitPrice = (line: CounterLine) =>
  ((line.variantId
    ? line.product.variants.find((variant) => variant.id === line.variantId)
        ?.price_minor
    : line.product.price_minor) ?? 0) +
  line.product.modifiers
    .filter((modifier) => line.modifierIds.includes(modifier.id))
    .reduce((total, modifier) => total + modifier.price_minor, 0);

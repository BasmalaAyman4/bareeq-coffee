import { type Product } from '@/types/catalog';
import { Coffee } from 'lucide-react';
export function Picture({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  // Keep drink cards visually consistent even when the source menu has no
  // product photo. Matcha and Refreshers use the closest branded drink visual
  // instead of falling back to the generic coffee placeholder.
  const sourceImage =
    product.image ||
    (product.category === 'Matcha'
      ? '/assets/matcha.webp'
      : product.category === 'Refreshers'
        ? '/assets/berry.webp'
        : undefined);
  const image = sourceImage
    ? sourceImage.startsWith('/') &&
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/bareeq-coffee')
      ? '/bareeq-coffee' + sourceImage
      : sourceImage
    : undefined;
  return sourceImage ? (
    <img
      src={image}
      alt={
        product.name +
        (!product.image || product.illustrative
          ? ' — illustrative drink visual'
          : ' — Bareeq product photograph')
      }
      width={large ? 900 : 480}
      height={large ? 1100 : 480}
      loading={large ? 'eager' : 'lazy'}
    />
  ) : (
    <div className="no-photo">
      <Coffee size={32} />
      <span>{product.sourceCategory}</span>
    </div>
  );
}

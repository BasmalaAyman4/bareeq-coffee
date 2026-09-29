import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import products from '@/data/products.json';
import site from '@/data/site.json';
import Link from '@/router';
import { Coffee, Minus, Plus } from 'lucide-react';
export type Product = (typeof products)[number];
export function price(value: number | null) {
  if (value === null) return 'Confirm with café';
  return (
    new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value) +
    (site.currency ? ' ' + site.currency : '')
  );
}
export function Picture({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  return product.image ? (
    <img
      src={product.image}
      alt={
        product.name +
        (product.illustrative
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
export function Quantity({
  value,
  onChange,
  name = 'quantity',
}: {
  value: number;
  onChange: (n: number) => void;
  name?: string;
}) {
  return (
    <div className="quantity">
      <Button
        className="quantity-button"
        variant="ghost"
        aria-label={'Decrease ' + name}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} />
      </Button>
      <output aria-label={name}>{value}</output>
      <Button
        className="quantity-button"
        variant="ghost"
        aria-label={'Increase ' + name}
        disabled={value >= 99}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}
export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <article
      className={'product-card ' + (!product.available ? 'unavailable' : '')}
    >
      <Link href={'/product/' + product.slug} className="product-image">
        <Picture product={product} />
        {!product.available && (
          <span className="availability">Currently unavailable</span>
        )}
      </Link>
      <div className="product-info">
        <Link href={'/product/' + product.slug}>
          <h3>{product.name}</h3>
        </Link>
        <div>
          <span className="price">{price(product.price)}</span>
          <Button
            className="icon-button add-button"
            aria-label={'Add ' + product.name + ' to bag'}
            disabled={!product.available}
            onClick={() => add(product.id)}
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>
    </article>
  );
}

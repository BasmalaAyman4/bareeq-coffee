import { useCopy } from '@/i18n/i18n-provider';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/hooks/use-cart';
import { Picture } from '@/features/catalog/components/product-image';
import { price } from '@/features/catalog/format-price';
import Link from '@/router';
import { type Product } from '@/types/catalog';
import { Plus } from 'lucide-react';
import { useI18n } from '@/i18n/i18n-provider';
import { catalogLabel } from '@/i18n/catalog-label';
export function ProductCard({ product }: { product: Product }) {
const tr = useCopy();

  const { add } = useCart();
  const { language, t } = useI18n();
  const name = catalogLabel(product, language);
  return (
    <article
      className={'product-card ' + (!product.available ? 'unavailable' : '')}
    >
      <Link href={'/product/' + product.slug} className="product-image">
        <Picture product={product} />
        {!product.available && (
          <span className="availability">{t('soldOut')}</span>
        )}
      </Link>
      <div className="product-info">
        <Link href={'/product/' + product.slug}>
          <h3>{name}</h3>
        </Link>
        <div>
          <span className="price">{tr(price(product.price))}</span>
          <Button
            className="icon-button add-button"
            aria-label={`${t('addToOrder')} ${name}`}
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

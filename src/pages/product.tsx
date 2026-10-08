import { useCopy } from '@/i18n/i18n-provider';
import { Button } from '@/components/ui/button';
import { Quantity } from '@/components/ui/quantity';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ProductCard } from '@/features/catalog/components/product-card';
import { Picture } from '@/features/catalog/components/product-image';
import { price } from '@/features/catalog/format-price';
import { useProducts } from '@/features/catalog/hooks/use-menu';
import Link from '@/router';
import { type Product } from '@/types/catalog';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/i18n/i18n-provider';
import { catalogLabel } from '@/i18n/catalog-label';
export function ProductPage({ product }: { product: Product }) {
  const tr = useCopy();

  const products = useProducts();
  const [q, setQ] = useState(1);
  const [variant, setVariant] = useState(
    product.variants.find((v) => v.available)?.id ?? '',
  );
  const [extras, setExtras] = useState<string[]>([]);
  const { add } = useCart();
  const { language, t } = useI18n();
  const name = catalogLabel(product, language);
  return (
    <div className="wrap page-content">
      <nav className="breadcrumb" aria-label={tr('Breadcrumb')}>
        <Link href="/menu">{t('menu')}</Link>
        <span>/</span>
        <Link href={'/menu?category=' + encodeURIComponent(product.category)}>
          {language === 'ar' && product.category_ar
            ? product.category_ar
            : tr(product.category)}
        </Link>
        <span>/</span>
        <span>{name}</span>
      </nav>
      <div className="product-detail">
        <div className="detail-image">
          <Picture product={product} large />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {language === 'ar' && product.category_ar
              ? product.category_ar
              : tr(product.category)}
          </p>
          <h1>{name}</h1>
          <p className="detail-price">{tr(price(product.price))}</p>
          {product.description && (
            <p className="product-description">
              {language === 'ar' && product.description_ar
                ? product.description_ar
                : product.description}
            </p>
          )}
          {product.id === 'La5EfigDxNwOuGZdhrp1' && (
            <div className="ingredient-list">
              <div>
                <h3>{tr('Cream')}</h3>
                <p>{tr('Smooth and rich cream for the perfect taste.')}</p>
              </div>
              <div>
                <h3>{tr('Nuts')}</h3>
                <p>{tr('Crunchy nuts that add texture and flavor.')}</p>
              </div>
              <div>
                <h3>{tr('Carrot cake')}</h3>
                <p>{tr('Moist and spiced carrot cake.')}</p>
              </div>
            </div>
          )}
          <p className="allergen-note">
            {tr(
              'Have an allergy or dietary requirement? Check ingredients with the café before ordering.',
            )}
          </p>
          <div className="product-order">
            {product.variants.length > 0 && (
              <label>
                {t('size')}
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                >
                  {product.variants
                    .filter((v) => v.available)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {catalogLabel(v, language)} ·{' '}
                        {tr(price(v.price_minor / 100))}
                      </option>
                    ))}
                </select>
              </label>
            )}
            {product.modifiers
              .filter((m) => m.available)
              .map((m) => (
                <label className="modifier-choice" key={m.id}>
                  <input
                    type="checkbox"
                    checked={extras.includes(m.id)}
                    onChange={(e) =>
                      setExtras(
                        e.target.checked
                          ? [...extras, m.id]
                          : extras.filter((id) => id !== m.id),
                      )
                    }
                  />
                  {catalogLabel(m, language)} +{tr(price(m.price_minor / 100))}
                </label>
              ))}
            <Quantity value={q} onChange={setQ} />
            <Button
              className="button"
              disabled={
                !product.available ||
                (product.variants.length > 0 && !variant) ||
                (product.price === null && !variant)
              }
              onClick={() => add(product.id, q, variant || null, extras)}
            >
              {product.available ? t('addToOrder') : t('soldOut')}
              <Plus size={18} />
            </Button>
          </div>
          {product.illustrative && (
            <p className="small-note">{tr('Illustrative drink image.')}</p>
          )}
          <p className="small-note">
            {tr(
              'Prices shown as published. Confirm currency and availability with Bareeq.',
            )}
          </p>
        </div>
      </div>
      <div className="section">
        <div className="section-heading">
          <h2>{tr('A little more Bareeq.')}</h2>
          <Link className="text-link" href="/menu">
            {tr('Back to menu')}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter(
              (p) => p.id !== product.id && p.category === product.category,
            )
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </div>
    </div>
  );
}

import {
  Picture,
  type Product,
  ProductCard,
  Quantity,
  price,
} from '@/components/products';
import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import products from '@/data/products.json';
import Link from '@/router';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useState } from 'react';
export function ProductPage({ product }: { product: Product }) {
  const [q, setQ] = useState(1);
  const { add } = useCart();
  return (
    <div className="wrap page-content">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/menu">Menu</Link>
        <span>/</span>
        <Link href={'/menu?category=' + encodeURIComponent(product.category)}>
          {product.category}
        </Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-detail">
        <div className="detail-image">
          <Picture product={product} large />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{price(product.price)}</p>
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}
          {product.id === 'La5EfigDxNwOuGZdhrp1' && (
            <div className="ingredient-list">
              <div>
                <h3>Cream</h3>
                <p>Smooth and rich cream for the perfect taste.</p>
              </div>
              <div>
                <h3>Nuts</h3>
                <p>Crunchy nuts that add texture and flavor.</p>
              </div>
              <div>
                <h3>Carrot cake</h3>
                <p>Moist and spiced carrot cake.</p>
              </div>
            </div>
          )}
          <p className="allergen-note">
            Have an allergy or dietary requirement? Check ingredients with the
            café before ordering.
          </p>
          <div className="product-order">
            <Quantity value={q} onChange={setQ} />
            <Button
              className="button"
              disabled={!product.available}
              onClick={() => add(product.id, q)}
            >
              {product.available ? 'Add to bag' : 'Currently unavailable'}
              <Plus size={18} />
            </Button>
          </div>
          {product.illustrative && (
            <p className="small-note">Illustrative drink image.</p>
          )}
          <p className="small-note">
            Prices shown as published. Confirm currency and availability with
            Bareeq.
          </p>
        </div>
      </div>
      <div className="section">
        <div className="section-heading">
          <h2>A little more Bareeq.</h2>
          <Link className="text-link" href="/menu">
            Back to menu <ArrowUpRight size={18} />
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

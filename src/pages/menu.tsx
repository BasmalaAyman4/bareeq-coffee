import { Button } from '@/components/ui/button';
import { ProductCard } from '@/features/catalog/components/product-card';
import { useMenu, useProducts } from '@/features/catalog/hooks/use-menu';
import { useEffect, useState } from 'react';
export function MenuPage({ category: initial = 'All' }: { category?: string }) {
  const products = useProducts();
  const menu = useMenu();
  const [category, setCategory] = useState(initial);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);
  const groups = ['All', ...(menu.data?.categories.map((c) => c.name) ?? [])];
  useEffect(() => {
    const c = new URLSearchParams(location.search).get('category');
    if (initial === 'All' && c && groups.includes(c)) setCategory(c);
  }, [initial, menu.data]);
  const results = products.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );
  function filter(c: string) {
    setCategory(c);
    setLimit(12);
    if (initial === 'All')
      history.replaceState(
        {},
        '',
        location.pathname +
          (c === 'All' ? '' : '?category=' + encodeURIComponent(c)),
      );
  }
  return (
    <div
      className={
        'wrap page-content ' +
        (initial === 'Savory'
          ? 'savory-page'
          : initial === 'Cakes & Sweets'
            ? 'cakes-page'
            : 'menu-page')
      }
    >
      <div className="page-heading">
        <p className="eyebrow">{initial === 'All' ? 'Menu' : initial}</p>
        <h1>
          {initial === 'Cakes & Sweets'
            ? 'A shine in every bite.'
            : initial === 'Savory'
              ? 'Fresh bites. Brighter days.'
              : 'Our Menu'}
        </h1>
      </div>
      {initial === 'Savory' && (
        <div className="savory-banner">
          <img
            src="/assets/sandwich.webp"
            alt="Bareeq sandwich photography"
            width="1200"
            height="1600"
          />
          <div>
            <h2>
              Fresh Bites,
              <br />
              Brighter Days
            </h2>
            <p>Explore Bareeq’s savory menu.</p>
            <a className="button light" href="#menu-grid">
              Explore Savory →
            </a>
          </div>
        </div>
      )}
      <div className="menu-controls" id="menu-grid">
        {initial === 'All' && (
          <div className="filters" aria-label="Menu categories">
            {groups.map((c) => (
              <Button
                key={c}
                variant="ghost"
                className={'filter ' + (c === category ? 'selected' : '')}
                aria-pressed={c === category}
                onClick={() => filter(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        )}
        <label className="search-label">
          <span className="sr-only">Search menu</span>
          <input
            type="search"
            placeholder="Search the menu"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(12);
            }}
          />
        </label>
      </div>
      <div className="results-line">
        <p role="status">
          {results.length} {results.length === 1 ? 'item' : 'items'}
        </p>
        <p>Current menu prices in EGP.</p>
      </div>
      {results.length ? (
        <div className="product-grid">
          {results.slice(0, limit).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {menu.isPending
              ? 'Loading the menu…'
              : menu.isError
                ? 'Menu temporarily unavailable.'
                : 'No matches just yet.'}
          </h2>
          <p>Try another product name or category.</p>
          <Button
            className="button"
            onClick={() => {
              setQuery('');
              filter(initial);
            }}
          >
            Reset filters
          </Button>
        </div>
      )}
      {results.length > limit && (
        <div className="load-more">
          <Button
            className="button outline"
            onClick={() => setLimit(limit + 12)}
          >
            Show more items ({results.length - limit})
          </Button>
        </div>
      )}
      <p className="menu-note">
        Drink artwork is illustrative where original photography is unavailable.
        Availability and final pricing are checked at checkout.
      </p>
    </div>
  );
}

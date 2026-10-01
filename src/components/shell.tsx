import Link, { usePathname } from '@/router';
import { ArrowUpRight, Coffee, House, MapPin, ShoppingBag } from 'lucide-react';
import { type ReactNode } from 'react';
import { Loader } from './loader';
import { useCart } from './cart-provider';

const mobileTabs = [
  { href: '/', label: 'Home', icon: House },
  { href: '/menu', label: 'Menu', icon: Coffee },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/cart', label: 'Bag', icon: ShoppingBag },
];

export function Brand() {
  return (
    <img
      className="brand-logo"
      src="/assets/bareeq-logo.png"
      alt="Bareeq — بريق"
      width="591"
      height="591"
    />
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname().replace(/\/$/, '') || '/';
  const { cart, notice } = useCart();
  const count = cart.reduce((n, l) => n + l.quantity, 0);
  const activeTab =
    ['/menu', '/cakes', '/savory'].includes(path) ||
    path.startsWith('/product/')
      ? '/menu'
      : path === '/checkout'
        ? '/cart'
        : path;
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div id="site-content">
        <header className="site-header wrap">
          <Link href="/" className="brand-link" aria-label="Bareeq home">
            <Brand />
          </Link>
          <nav
            aria-label="Main navigation"
            className="main-nav"
            id="main-navigation"
          >
            {[
              ['/', 'Home'],
              ['/menu', 'Menu'],
              ['/cakes', 'Cakes & Sweets'],
              ['/savory', 'Savory'],
              ['/locations', 'Locations'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link
              className="bag-link"
              href="/cart"
              aria-label={'Shopping bag, ' + count + ' items'}
            >
              <ShoppingBag size={21} />
              <span>{count}</span>
            </Link>
            <Link href="/menu" className="button header-order">
              Order now <ArrowUpRight size={16} />
            </Link>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap footer-inner">
            <Link href="/" aria-label="Bareeq home">
              <Brand />
            </Link>
            <p>
              A shine in every sip.
              <br />A shine in every bite.
            </p>
            <nav aria-label="Footer navigation">
              <Link href="/menu">Menu</Link>
              <Link href="/locations">Locations</Link>
              <a
                href="https://www.instagram.com/bareeq.eg__/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram ↗
              </a>
              <a
                href="https://bareeq-coffee.web.app/"
                target="_blank"
                rel="noreferrer"
              >
                Original menu ↗
              </a>
            </nav>
          </div>
        </footer>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {mobileTabs.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="mobile-nav-link"
              aria-current={activeTab === href ? 'page' : undefined}
              aria-label={
                href === '/cart' ? `Shopping bag, ${count} items` : undefined
              }
            >
              <span className="mobile-nav-icon">
                <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                {href === '/cart' && count > 0 && (
                  <span className="mobile-nav-count" aria-hidden="true">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div
        className={'toast ' + (notice ? 'visible' : '')}
        role="status"
        aria-live="polite"
      >
        {notice}
        <Link href="/cart">View bag →</Link>
      </div>
      <Loader />
    </>
  );
}

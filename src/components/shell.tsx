import { Button } from '@/components/ui/button';
import Link, { usePathname } from '@/router';
import { ArrowUpRight, Menu as MenuIcon, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Loader } from './loader';
import { useCart } from './cart-provider';
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
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { cart, notice } = useCart();
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);
  const count = cart.reduce((n, l) => n + l.quantity, 0);
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
            className={open ? 'main-nav open' : 'main-nav'}
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
            <Button
              className="icon-button mobile-toggle"
              variant="ghost"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="main-navigation"
              aria-label={open ? 'Close navigation' : 'Open navigation'}
            >
              {open ? <X /> : <MenuIcon />}
            </Button>
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

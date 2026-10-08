import { useCopy } from '@/i18n/i18n-provider';
import { Loader } from '@/components/loader';
import { useCart } from '@/features/cart/hooks/use-cart';
import { MobileNavigation } from '@/layouts/storefront/mobile-navigation';
import { StorefrontFooter } from '@/layouts/storefront/storefront-footer';
import { StorefrontHeader } from '@/layouts/storefront/storefront-header';
import Link, { usePathname } from '@/router';
import { type ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  const tr = useCopy();

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
        {tr('Skip to content')}
      </a>
      <div id="site-content">
        <StorefrontHeader path={path} count={count} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <StorefrontFooter />
        <MobileNavigation activeTab={activeTab} count={count} />
      </div>
      <div
        className={'toast ' + (notice ? 'visible' : '')}
        role="status"
        aria-live="polite"
      >
        {notice}
        <Link href="/cart">{tr('View bag →')}</Link>
      </div>
      <Loader />
    </>
  );
}

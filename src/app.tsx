import { useCopy } from '@/i18n/i18n-provider';
import { MenuStatus } from '@/features/catalog/components/menu-status';
import { useMenu, useProducts } from '@/features/catalog/hooks/use-menu';
import { CartProvider } from '@/providers/cart-provider';
import { BackendProvider } from '@/providers/query-provider';
import { useEffect } from 'react';
import { Shell } from './layouts/storefront/storefront-layout';
import { CartPage } from './pages/cart';
import { Dashboard } from './features/dashboard/dashboard-workspace';
import { Home } from './pages/home';
import { LocationsPage } from './pages/locations';
import { MenuPage } from './pages/menu';
import { NotFound } from './pages/not-found';
import { ProductPage } from './pages/product';
import { usePathname } from './router';
import { pageTitles } from './routes';
import { I18nProvider } from './i18n/i18n-provider';

import { FounderPage } from './pages/founder';
import { CashierPage } from './pages/cashier';

export function App() {
  return (
    <I18nProvider>
      <BackendProvider>
        <AppContent />
      </BackendProvider>
    </I18nProvider>
  );
}
function AppContent() {
  const tr = useCopy();

  const products = useProducts();
  const menu = useMenu();
  const rawPath = usePathname();
  const path = rawPath.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';
  const product = path.startsWith('/product/')
    ? products.find((item) => item.slug === path.slice('/product/'.length))
    : undefined;

  useEffect(() => {
    document.title = `${tr(product?.name || pageTitles[path] || 'Page not found')} | ${tr('Bareeq')}`;
  }, [path, product, tr]);

  function renderPage() {
    switch (path) {
      case '/dashboard':
        return <Dashboard />;
      case '/founder':
        return <FounderPage />;
      case '/cashier':
        return <CashierPage />;
      case '/':
        return <Home />;
      case '/menu':
        return <MenuPage key="menu" />;
      case '/cakes':
        return <MenuPage key="cakes" category="Cakes & Sweets" />;
      case '/savory':
        return <MenuPage key="savory" category="Savory" />;
      case '/locations':
        return <LocationsPage />;
      case '/cart':
        return <CartPage key="cart" />;
      case '/checkout':
        return <CartPage key="checkout" checkout />;
      default:
        return path.startsWith('/product/') && menu.isPending ? (
          <div className="wrap page-content" role="status">
            {tr('Loading your selection…')}
          </div>
        ) : product ? (
          <ProductPage key={product.id} product={product} />
        ) : (
          <NotFound />
        );
    }
  }

  const isStaffRoute = ['/dashboard', '/founder', '/cashier'].includes(path);

  return (
    <CartProvider>
      {isStaffRoute ? (
        renderPage()
      ) : (
        <Shell>
          {path !== '/' && <MenuStatus />}
          {renderPage()}
        </Shell>
      )}
    </CartProvider>
  );
}

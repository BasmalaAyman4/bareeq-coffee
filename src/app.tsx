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
  const products = useProducts();
  const menu = useMenu();
  const path = usePathname().replace(/\/$/, '') || '/';
  const product = path.startsWith('/product/')
    ? products.find((item) => item.slug === path.slice('/product/'.length))
    : undefined;

  useEffect(() => {
    document.title = `${product?.name || pageTitles[path] || 'Page not found'} | Bareeq`;
  }, [path, product]);

  function renderPage() {
    switch (path) {
      case '/dashboard':
        return <Dashboard />;
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
            Loading your selection…
          </div>
        ) : product ? (
          <ProductPage key={product.id} product={product} />
        ) : (
          <NotFound />
        );
    }
  }

  return (
    <CartProvider>
      {path === '/dashboard' ? (
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

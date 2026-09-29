import { useEffect } from 'react';
import { CartProvider } from './components/cart-provider';
import { Shell } from './components/shell';
import products from './data/products.json';
import { CartPage } from './pages/cart';
import { Home } from './pages/home';
import { LocationsPage } from './pages/locations';
import { MenuPage } from './pages/menu';
import { NotFound } from './pages/not-found';
import { ProductPage } from './pages/product';
import { usePathname } from './router';
import { pageTitles } from './routes';

export function App() {
  const path = usePathname().replace(/\/$/, '') || '/';
  const product = path.startsWith('/product/')
    ? products.find((item) => item.slug === path.slice('/product/'.length))
    : undefined;

  useEffect(() => {
    document.title = `${product?.name || pageTitles[path] || 'Page not found'} | Bareeq`;
  }, [path, product]);

  function renderPage() {
    switch (path) {
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
        return product ? (
          <ProductPage key={product.id} product={product} />
        ) : (
          <NotFound />
        );
    }
  }

  return (
    <CartProvider>
      <Shell>{renderPage()}</Shell>
    </CartProvider>
  );
}

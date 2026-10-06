import Link from '@/router';
import { Coffee, House, MapPin, ShoppingBag } from 'lucide-react';
import { useI18n } from '@/i18n/i18n-provider';
export function MobileNavigation({
  activeTab,
  count,
}: {
  activeTab: string;
  count: number;
}) {
  const { t } = useI18n();
  const tabs = [
    { href: '/', label: t('home'), icon: House },
    { href: '/menu', label: t('menu'), icon: Coffee },
    { href: '/locations', label: t('locations'), icon: MapPin },
    { href: '/cart', label: t('cart'), icon: ShoppingBag },
  ];
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="mobile-nav-link"
          aria-current={activeTab === href ? 'page' : undefined}
          aria-label={
            href === '/cart'
              ? `${t('cart')}, ${count} ${t('items')}`
              : undefined
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
  );
}

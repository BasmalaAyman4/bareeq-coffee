import { useCopy } from '@/i18n/i18n-provider';
import { Brand } from '@/components/brand';
import Link from '@/router';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useI18n } from '@/i18n/i18n-provider';

export function StorefrontHeader({
  path,
  count,
}: {
  path: string;
  count: number;
}) {
  const tr = useCopy();

  const { t } = useI18n();
  return (
    <header className="site-header wrap">
      <Link href="/" className="brand-link" aria-label={tr('Bareeq home')}>
        <Brand />
      </Link>
      <nav
        aria-label={tr('Main navigation')}
        className="main-nav"
        id="main-navigation"
      >
        {[
          ['/', t('home')],
          ['/menu', t('menu')],
          ['/cakes', t('cakes')],
          ['/savory', t('savory')],
          ['/locations', t('locations')],
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
          aria-label={`${t('cart')}, ${count} ${t('items')}`}
        >
          <ShoppingBag size={21} />
          <span>{count}</span>
        </Link>
        <Link href="/menu" className="button header-order">
          {t('orderNow')} <ArrowUpRight size={16} />
        </Link>
        <LanguageToggle compact />
      </div>
    </header>
  );
}

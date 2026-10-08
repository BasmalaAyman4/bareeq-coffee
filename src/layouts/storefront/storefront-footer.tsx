import { useCopy } from '@/i18n/i18n-provider';
import { Brand } from '@/components/brand';
import Link from '@/router';
import { useI18n } from '@/i18n/i18n-provider';

export function StorefrontFooter({}: {}) {
  const tr = useCopy();

  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Link href="/" aria-label={tr('Bareeq home')}>
          <Brand />
        </Link>
        <p>
          {t('home')} {tr('· Bareeq coffee.')}
          <br />
          {tr('A shine in every bite.')}
        </p>
        <nav aria-label={tr('Footer navigation')}>
          <Link href="/menu">{t('menu')}</Link>
          <Link href="/locations">{t('locations')}</Link>
          <a
            href="https://www.instagram.com/bareeq.eg__/"
            target="_blank"
            rel="noreferrer"
          >
            {tr('Instagram ↗')}
          </a>
          <a
            href="https://bareeq-coffee.web.app/"
            target="_blank"
            rel="noreferrer"
          >
            {tr('Original menu ↗')}
          </a>
        </nav>
      </div>
    </footer>
  );
}

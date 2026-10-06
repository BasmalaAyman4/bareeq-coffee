import { Brand } from '@/components/brand';
import Link from '@/router';
import { useI18n } from '@/i18n/i18n-provider';

export function StorefrontFooter({}: {}) {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Link href="/" aria-label="Bareeq home">
          <Brand />
        </Link>
        <p>
          {t('home')} · Bareeq coffee.
          <br />A shine in every bite.
        </p>
        <nav aria-label="Footer navigation">
          <Link href="/menu">{t('menu')}</Link>
          <Link href="/locations">{t('locations')}</Link>
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
  );
}

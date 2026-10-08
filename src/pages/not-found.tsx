import { useCopy } from '@/i18n/i18n-provider';
import Link from '@/router';
export function NotFound() {
  const tr = useCopy();

  return (
    <div className="wrap page-content empty-state">
      <p className="eyebrow">404</p>
      <h1>{tr('This page has wandered off.')}</h1>
      <Link className="button" href="/menu">
        {tr('Back to the menu')}
      </Link>
    </div>
  );
}

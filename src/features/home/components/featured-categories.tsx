import { useCopy } from '@/i18n/i18n-provider';
import Link from '@/router';
import { ArrowUpRight } from 'lucide-react';

export function FeaturedCategories({}: {}) {
  const tr = useCopy();

  return (
    <section className="wrap section">
      <p className="eyebrow">{tr('Something savory')}</p>
      <h2>{tr('More than a coffee stop.')}</h2>
      <div className="savory-feature">
        <div>
          <h3>
            {tr('Fresh Bites,')}
            <br />
            {tr('Brighter Days')}
          </h3>
          <Link className="button" href="/savory">
            {tr('Explore savory')}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <img
          src="/assets/sandwich.webp"
          width="1200"
          height="1600"
          alt={tr('Bareeq sandwich served on a burgundy-lined tray')}
          loading="lazy"
        />
      </div>
    </section>
  );
}

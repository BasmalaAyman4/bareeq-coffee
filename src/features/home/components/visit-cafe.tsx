import { useCopy } from '@/i18n/i18n-provider';
import Link from '@/router';
import { ArrowUpRight, MapPin, Sparkles } from 'lucide-react';

export function VisitCafe({}: {}) {
  const tr = useCopy();

  return (
    <section className="wrap section visit">
      <h2>
        {tr('A little shine,')}
        <br />
        {tr('wherever you are.')}
      </h2>
      <div className="visit-grid">
        <Link href="/locations" className="visit-card">
          <MapPin size={32} />
          <h3>{tr('Find your Bareeq')}</h3>
          <p>{tr('Helwan · Mostafa Safwat Street')}</p>
          <span className="text-link">
            {tr('Visit us')}
            <ArrowUpRight size={18} />
          </span>
        </Link>
        <a
          className="visit-card wine"
          href="https://www.instagram.com/bareeq.eg__/"
          target="_blank"
          rel="noreferrer"
        >
          <Sparkles size={32} />
          <h3>{tr('Brighter moments.')}</h3>
          <p>{tr('Follow the latest from Bareeq.')}</p>
          <span className="text-link">
            {tr('Instagram')}
            <ArrowUpRight size={18} />
          </span>
        </a>
      </div>
    </section>
  );
}

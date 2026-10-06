import Link from '@/router';
import { ArrowUpRight, MapPin, Sparkles } from 'lucide-react';

export function VisitCafe({}: {}) {
  return (
    <section className="wrap section visit">
      <h2>
        A little shine,
        <br />
        wherever you are.
      </h2>
      <div className="visit-grid">
        <Link href="/locations" className="visit-card">
          <MapPin size={32} />
          <h3>Find your Bareeq</h3>
          <p>Helwan · Mostafa Safwat Street</p>
          <span className="text-link">
            Visit us <ArrowUpRight size={18} />
          </span>
        </Link>
        <a
          className="visit-card wine"
          href="https://www.instagram.com/bareeq.eg__/"
          target="_blank"
          rel="noreferrer"
        >
          <Sparkles size={32} />
          <h3>Brighter moments.</h3>
          <p>Follow the latest from Bareeq.</p>
          <span className="text-link">
            Instagram <ArrowUpRight size={18} />
          </span>
        </a>
      </div>
    </section>
  );
}

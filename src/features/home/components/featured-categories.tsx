import Link from '@/router';
import { ArrowUpRight } from 'lucide-react';

export function FeaturedCategories({}: {}) {
  return (
    <section className="wrap section">
      <p className="eyebrow">Something savory</p>
      <h2>More than a coffee stop.</h2>
      <div className="savory-feature">
        <div>
          <h3>
            Fresh Bites,
            <br />
            Brighter Days
          </h3>
          <Link className="button" href="/savory">
            Explore savory <ArrowUpRight size={18} />
          </Link>
        </div>
        <img
          src="/assets/sandwich.webp"
          width="1200"
          height="1600"
          alt="Bareeq sandwich served on a burgundy-lined tray"
          loading="lazy"
        />
      </div>
    </section>
  );
}

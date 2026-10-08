import { useCopy } from '@/i18n/i18n-provider';
import Link from '@/router';
import { ArrowUpRight } from 'lucide-react';
const categories = [
  ['Coffee', 'hero-coffee'],
  ['Matcha', 'matcha'],
  ['Refreshers', 'berry'],
  ['Cakes & Sweets', 'red-velvet'],
];

export function MenuStory({}: {}) {
  const tr = useCopy();

  return (
    <section className="wrap section menu-story">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{tr('Explore our menu')}</p>
          <h2>
            {tr('Your favourites,')}
            <br />
            {tr('brighter.')}
          </h2>
        </div>
        <Link className="text-link" href="/menu">
          {tr('View all menu')}
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="category-grid">
        {categories.map(([name, image]) => (
          <Link
            className="category-card"
            href={'/menu?category=' + encodeURIComponent(name)}
            key={tr(name)}
          >
            <img
              src={'/assets/' + image + '.webp'}
              alt={tr(name)}
              width="600"
              height="600"
              loading="lazy"
            />
            <span>
              {tr(name)}
              <ArrowUpRight size={20} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

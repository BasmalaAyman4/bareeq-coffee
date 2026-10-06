import Link from '@/router';
import { ArrowUpRight } from 'lucide-react';
const categories = [
  ['Coffee', 'hero-coffee'],
  ['Matcha', 'matcha'],
  ['Refreshers', 'berry'],
  ['Cakes & Sweets', 'red-velvet'],
];

export function MenuStory({}: {}) {
  return (
    <section className="wrap section menu-story">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Explore our menu</p>
          <h2>
            Your favourites,
            <br />
            brighter.
          </h2>
        </div>
        <Link className="text-link" href="/menu">
          View all menu <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="category-grid">
        {categories.map(([name, image]) => (
          <Link
            className="category-card"
            href={'/menu?category=' + encodeURIComponent(name)}
            key={name}
          >
            <img
              src={'/assets/' + image + '.webp'}
              alt={name}
              width="600"
              height="600"
              loading="lazy"
            />
            <span>
              {name}
              <ArrowUpRight size={20} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Link from '@/router';
import { ArrowUpRight } from 'lucide-react';

export function CoffeeStory({}: {}) {
  return (
    <section className="wrap editorial wine">
      <div>
        <p className="eyebrow">A shine in every bite</p>
        <h2>
          Cakes that make
          <br />
          the moment brighter.
        </h2>
        <p>Red velvet. Carrot cake. A little something sweet.</p>
        <Link className="button light" href="/cakes">
          Explore cakes & sweets <ArrowUpRight size={18} />
        </Link>
      </div>
      <img
        src="/assets/red-velvet.webp"
        width="900"
        height="1200"
        alt="Bareeq’s original Red Velvet Cake campaign"
        loading="lazy"
      />
    </section>
  );
}

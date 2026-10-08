import { useCopy } from '@/i18n/i18n-provider';
import Link from '@/router';
import { ArrowUpRight } from 'lucide-react';

export function CoffeeStory({}: {}) {
  const tr = useCopy();

  return (
    <section className="wrap editorial wine">
      <div>
        <p className="eyebrow">{tr('A shine in every bite')}</p>
        <h2>
          {tr('Cakes that make')}
          <br />
          {tr('the moment brighter.')}
        </h2>
        <p>{tr('Red velvet. Carrot cake. A little something sweet.')}</p>
        <Link className="button light" href="/cakes">
          {tr('Explore cakes & sweets')}
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <img
        src="/assets/red-velvet.webp"
        width="900"
        height="1200"
        alt={tr('Bareeq’s original Red Velvet Cake campaign')}
        loading="lazy"
      />
    </section>
  );
}

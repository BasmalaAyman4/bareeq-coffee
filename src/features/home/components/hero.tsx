import Link from '@/router';
import { ArrowUpRight } from 'lucide-react';

export function Hero({}: {}) {
  return (
    <section className="hero hero-sculpture wrap" aria-labelledby="hero-title">
      <div className="hero-headline">
        <p className="eyebrow">More than coffee</p>
        <h1 id="hero-title">
          <span className="hero-pretitle">A Brighter</span>
          <span className="hero-coffee-word">Coffee</span>
          <span className="hero-experience-word">Experience</span>
        </h1>
      </div>
      <div className="hero-cup-scene" aria-hidden="true">
        <div className="hero-traveller">
          <img
            className="hero-cup"
            src="/assets/bareeq-iced-cup-hero.png"
            alt=""
            width="1024"
            height="1536"
            fetchPriority="high"
          />
          <img
            className="hero-cup-splash"
            src="/assets/coffee-splash-cutout.webp"
            alt=""
            width="1774"
            height="887"
          />
        </div>
        <div className="hero-impact-burst">
          <div className="burst-ring" />
          <div className="burst-flash" />
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <img
            key={i}
            className={'hero-bean hero-bean-' + i}
            src="/assets/coffee-bean-cutout.webp"
            alt=""
            width="1323"
            height="1189"
          />
        ))}
      </div>
      <div className="hero-bottom-copy">
        <p>
          Specialty coffee, crafted with care
          <br />
          and a touch of Bareeq.
        </p>
        <Link className="button" href="/menu">
          Order now <ArrowUpRight size={18} />
        </Link>
      </div>
      <p className="hero-signature">
        A shine
        <br />
        in every sip.
      </p>
    </section>
  );
}

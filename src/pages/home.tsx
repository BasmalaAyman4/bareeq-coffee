import Link from '@/router';
import { useMenuStory } from '@/components/menu-story';
import { ArrowUpRight, Bean, Coffee, MapPin, Sparkles } from 'lucide-react';

const categories = [
  ['Coffee', 'hero-coffee'],
  ['Matcha', 'matcha'],
  ['Refreshers', 'berry'],
  ['Cakes & Sweets', 'red-velvet'],
];
export function Home() {
  useMenuStory();
  return (
    <>
      <section
        className="hero hero-sculpture wrap"
        aria-labelledby="hero-title"
      >
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
      <div className="values wrap">
        <span>
          <Bean />
          Premium coffee beans
        </span>
        <span>
          <Coffee />
          Unique flavors
        </span>
        <span>
          <Sparkles />A touch of Bareeq
        </span>
        <span>
          <Coffee />
          Refreshing every day
        </span>
      </div>
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
    </>
  );
}

import site from '@/data/site.json';
import { ArrowUpRight, MapPin, MessageCircle } from 'lucide-react';
export function LocationsPage() {
  return (
    <div className="wrap page-content">
      <div className="page-heading">
        <p className="eyebrow">Locations</p>
        <h1>Find your Bareeq.</h1>
      </div>
      <div className="locations-grid">
        <iframe
          className="location-map"
          title="Bareeq location in Helwan"
          src={site.mapEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div>
          <div className="location-card">
            <MapPin size={28} />
            <h2>Bareeq · Helwan</h2>
            <p>Mostafa Safwat Street</p>
            <p lang="ar" dir="rtl">
              {site.address}
            </p>
            <p className="small-note">
              Contact the café for today’s opening hours.
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=29.848157709398134%2C31.340120293034396"
              className="button"
              target="_blank"
              rel="noreferrer"
            >
              Get directions <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="location-contact">
            <h3>Before you visit</h3>
            <p>Ask us about opening hours and product availability.</p>
            <a
              href={'https://wa.me/' + site.whatsapp.replace(/\D/g, '')}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Contact Bareeq <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

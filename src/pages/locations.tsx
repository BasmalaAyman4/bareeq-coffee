import { useCopy } from '@/i18n/i18n-provider';
import site from '@/data/site.json';
import { ArrowUpRight, MapPin, MessageCircle } from 'lucide-react';
export function LocationsPage() {
  const tr = useCopy();

  return (
    <div className="wrap page-content">
      <div className="page-heading">
        <p className="eyebrow">{tr('Locations')}</p>
        <h1>{tr('Find your Bareeq.')}</h1>
      </div>
      <div className="locations-grid">
        <iframe
          className="location-map"
          title={tr('Bareeq location in Helwan')}
          src={site.mapEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div>
          <div className="location-card">
            <MapPin size={28} />
            <h2>{tr('Bareeq · Helwan')}</h2>
            <p>{tr('Mostafa Safwat Street')}</p>
            <p lang="ar" dir="rtl">
              {site.address}
            </p>
            <p className="small-note">
              {tr('Contact the café for today’s opening hours.')}
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=29.848157709398134%2C31.340120293034396"
              className="button"
              target="_blank"
              rel="noreferrer"
            >
              {tr('Get directions')}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="location-contact">
            <h3>{tr('Before you visit')}</h3>
            <p>{tr('Ask us about opening hours and product availability.')}</p>
            <a
              href={'https://wa.me/' + site.whatsapp.replace(/\D/g, '')}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              {tr('Contact Bareeq')}
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

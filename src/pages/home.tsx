import { useCopy } from '@/i18n/i18n-provider';
import { CoffeeStory } from '@/features/home/components/coffee-story';
import { FeaturedCategories } from '@/features/home/components/featured-categories';
import { Hero } from '@/features/home/components/hero';
import { MenuStory } from '@/features/home/components/menu-story';
import { VisitCafe } from '@/features/home/components/visit-cafe';
import { useMenuStory } from '@/features/home/use-menu-story';
import { Bean, Coffee, Sparkles } from 'lucide-react';

export function Home() {
  const tr = useCopy();

  useMenuStory();
  return (
    <>
      <Hero />
      <div className="values wrap">
        <span>
          <Bean />
          {tr('Premium coffee beans')}
        </span>
        <span>
          <Coffee />
          {tr('Unique flavors')}
        </span>
        <span>
          <Sparkles />
          {tr('A touch of Bareeq')}
        </span>
        <span>
          <Coffee />
          {tr('Refreshing every day')}
        </span>
      </div>
      <MenuStory />
      <CoffeeStory />
      <FeaturedCategories />
      <VisitCafe />
    </>
  );
}

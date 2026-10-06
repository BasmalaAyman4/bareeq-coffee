import { UIButton } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { money } from '@/lib/money';
import { Search } from 'lucide-react';

import type { Controller } from '@/features/counter/hooks/use-counter-order';
import { useI18n } from '@/i18n/i18n-provider';
import { catalogLabel } from '@/i18n/catalog-label';
export function CounterMenu({
  menu,
  category,
  setCategory,
  search,
  setSearch,
  products,
  openProduct,
}: Pick<
  Controller,
  | 'menu'
  | 'category'
  | 'setCategory'
  | 'search'
  | 'setSearch'
  | 'products'
  | 'openProduct'
>) {
  const { t, language } = useI18n();
  return (
    <div className="rounded-3xl border border-bareeq-espresso/10 bg-bareeq-ivory p-4 shadow-sm sm:p-5">
      <div className="flex flex-col justify-between gap-4 border-b border-bareeq-espresso/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow !mb-1">{t('counterSale')}</p>
          <h2 className="!m-0 text-2xl">{t('newCounterOrder')}</h2>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/4 -translate-y-1/2 text-bareeq-espresso/45"
            size={17}
          />
          <TextInput
            className="!h-10 !rounded-xl !pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`${t('search')} ${t('menu').toLowerCase()}`}
          />
        </div>
      </div>
      <div className="my-4 flex gap-2 overflow-x-auto pb-1">
        <UIButton
          tone={category === 'all' ? 'primary' : 'secondary'}
          className="!min-h-9 !shrink-0 !rounded-lg !px-3 !py-1.5"
          onClick={() => setCategory('all')}
        >
          {t('menu')}
        </UIButton>
        {menu.data?.categories.map((item) => (
          <UIButton
            key={item.id}
            tone={category === item.id ? 'primary' : 'secondary'}
            className="!min-h-9 !shrink-0 !rounded-lg !px-3 !py-1.5"
            onClick={() => setCategory(item.id)}
          >
            {item.name}
          </UIButton>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => (
          <button
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-bareeq-espresso/10 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-bareeq-burgundy/35 hover:shadow-md"
            onClick={() => openProduct(product)}
          >
            <div className="aspect-[4/3] bg-bareeq-cream/55 p-3">
              {product.image ? (
                <img
                  className="size-full object-contain mix-blend-multiply"
                  src={product.image}
                  alt=""
                />
              ) : (
                <div className="grid size-full place-items-center text-3xl">
                  ☕
                </div>
              )}
            </div>
            <div className="p-3">
              <strong className="block min-h-10 leading-5 text-bareeq-espresso">
                {catalogLabel(product, language)}
              </strong>
              <span className="mt-1 block text-sm font-bold text-bareeq-burgundy">
                {product.price_minor === null
                  ? t('chooseSize')
                  : money(product.price_minor)}
              </span>
            </div>
          </button>
        ))}
      </div>
      {!products.length && (
        <p className="py-12 text-center text-bareeq-espresso/60">
          {t('noItems')}
        </p>
      )}
    </div>
  );
}

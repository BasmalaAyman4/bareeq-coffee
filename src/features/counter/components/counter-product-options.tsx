import { UIButton } from '@/components/ui/button';
import { Dialog } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { money } from '@/lib/money';

import type { Controller } from '@/features/counter/hooks/use-counter-order';
import { useI18n } from '@/i18n/i18n-provider';
import { catalogLabel } from '@/i18n/catalog-label';
export function CounterProductOptions({
  selected,
  setSelected,
  variantId,
  setVariantId,
  modifierIds,
  setModifierIds,
  add,
}: Pick<
  Controller,
  | 'selected'
  | 'setSelected'
  | 'variantId'
  | 'setVariantId'
  | 'modifierIds'
  | 'setModifierIds'
  | 'add'
>) {
  const { t, language } = useI18n();
  return (
    <Dialog
      open={!!selected}
      title={selected ? catalogLabel(selected, language) : t('addToOrder')}
      onClose={() => setSelected(null)}
      footer={
        <>
          <UIButton tone="secondary" onClick={() => setSelected(null)}>
            {t('cancel')}
          </UIButton>
          <UIButton
            onClick={add}
            disabled={!!selected?.variants.length && !variantId}
          >
            {t('addToOrder')}
          </UIButton>
        </>
      }
    >
      {selected && (
        <div className="space-y-5">
          {selected.variants.length > 0 && (
            <label className="block text-sm font-bold text-bareeq-espresso">
              {t('size')}
              <Select
                className="mt-2"
                value={variantId ?? ''}
                onChange={(event) => setVariantId(event.target.value || null)}
              >
                <option value="">{t('chooseSize')}</option>
                {selected.variants
                  .filter((variant) => variant.available)
                  .map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {catalogLabel(variant, language)} ·{' '}
                      {money(variant.price_minor)}
                    </option>
                  ))}
              </Select>
            </label>
          )}
          {selected.modifiers.filter((modifier) => modifier.available).length >
            0 && (
            <fieldset>
              <legend className="text-sm font-bold text-bareeq-espresso">
                {t('extras')}
              </legend>
              <div className="mt-2 grid gap-2">
                {selected.modifiers
                  .filter((modifier) => modifier.available)
                  .map((modifier) => (
                    <label
                      key={modifier.id}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-bareeq-espresso/12 bg-white px-3 py-2.5 text-sm"
                    >
                      <span>
                        <input
                          className="mr-2 accent-bareeq-burgundy"
                          type="checkbox"
                          checked={modifierIds.includes(modifier.id)}
                          onChange={(event) =>
                            setModifierIds((current) =>
                              event.target.checked
                                ? [...current, modifier.id]
                                : current.filter((id) => id !== modifier.id),
                            )
                          }
                        />
                        {catalogLabel(modifier, language)}
                      </span>
                      <strong>{money(modifier.price_minor)}</strong>
                    </label>
                  ))}
              </div>
            </fieldset>
          )}
          {!selected.variants.length && !selected.modifiers.length && (
            <p className="m-0 text-bareeq-espresso/65">
              This item will be added as shown.
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}

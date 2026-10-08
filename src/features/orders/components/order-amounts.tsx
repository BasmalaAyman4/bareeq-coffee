import { useCopy } from '@/i18n/i18n-provider';
import { useI18n } from '@/i18n/i18n-provider';
import { money } from '@/lib/money';

export function OrderAmounts({
  itemsMinor,
  deliveryMinor,
  totalMinor,
}: {
  itemsMinor: number;
  deliveryMinor: number;
  totalMinor: number;
}) {
const tr = useCopy();

  const { isArabic } = useI18n();
  return (
    <dl className="my-4">
      <div className="flex justify-between gap-4 py-2">
        <dt>{isArabic ? 'حساب المنتجات' : 'Items subtotal'}</dt>
        <dd className="m-0" dir="ltr">
          {tr(money(itemsMinor))}
        </dd>
      </div>
      <div className="flex justify-between gap-4 py-2">
        <dt>{isArabic ? 'التوصيل' : 'Delivery'}</dt>
        <dd className="m-0" dir="ltr">
          {tr(money(deliveryMinor))}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-current/15 py-3 font-bold">
        <dt>{isArabic ? 'الإجمالي' : 'Total'}</dt>
        <dd className="m-0" dir="ltr">
          {tr(money(totalMinor))}
        </dd>
      </div>
    </dl>
  );
}

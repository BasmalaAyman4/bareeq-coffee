import { useCopy } from '@/i18n/i18n-provider';
import Link from '@/router';
import { useI18n } from '@/i18n/i18n-provider';
import { OrderAmounts } from '@/features/orders/components/order-amounts';

import type { Controller } from '@/features/checkout/hooks/use-checkout';
export function OrderSummary({
  checkout,
  staff,
  cart,
  quote,
  busy,
  subtotal,
  canOrder,
  place,
  method,
  receiptFile,
  deliveryMinor,
  estimatedTotal,
}: Pick<
  Controller,
  | 'checkout'
  | 'staff'
  | 'cart'
  | 'quote'
  | 'busy'
  | 'subtotal'
  | 'canOrder'
  | 'place'
  | 'method'
  | 'receiptFile'
  | 'deliveryMinor'
  | 'estimatedTotal'
>) {
  const tr = useCopy();

  const { isArabic } = useI18n();
  return (
    <aside className="order-summary">
      <h2>{isArabic ? 'ملخص الطلب' : 'Order summary'}</h2>
      <dl>
        <div>
          <dt>{isArabic ? 'عدد المنتجات' : 'Item count'}</dt>
          <dd>{cart.reduce((n, l) => n + l.quantity, 0)}</dd>
        </div>
      </dl>
      <OrderAmounts
        itemsMinor={quote?.items_minor ?? subtotal}
        deliveryMinor={quote?.delivery_minor ?? deliveryMinor}
        totalMinor={quote?.total_minor ?? estimatedTotal}
      />
      {quote ? (
        <>
          <p>
            {isArabic
              ? 'تمت مراجعة الحساب. أكّد لإرسال طلبك.'
              : 'This total was calculated by Bareeq. Confirm to place your order.'}
          </p>
          {method === 'instapay' && !receiptFile && (
            <p>
              {isArabic
                ? 'ارفع إيصال التحويل لإرسال الطلب.'
                : 'Upload your transfer receipt to place the order.'}
            </p>
          )}
          <button
            className="button light"
            disabled={
              busy || !canOrder || (method === 'instapay' && !receiptFile)
            }
            onClick={place}
          >
            {busy
              ? isArabic
                ? 'جاري إرسال الطلب…'
                : 'Placing order…'
              : isArabic
                ? 'إرسال الطلب'
                : 'Place order'}
          </button>
        </>
      ) : (
        <p>
          {isArabic
            ? 'بنراجع الأسعار والتوفر قبل تأكيد الطلب.'
            : 'We check the current prices and availability before you confirm.'}
        </p>
      )}
      {!canOrder && (
        <p role="alert">
          {tr('Remove unavailable items or choose their required size.')}
        </p>
      )}
      {!checkout && !staff && (
        <Link className="button light" href="/checkout">
          {tr('Continue to checkout')}
        </Link>
      )}
    </aside>
  );
}

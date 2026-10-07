import { Dialog } from '@/components/ui/modal';
import { ImageUpload } from '@/components/ui/image-upload';
import { OrderAmounts } from '@/features/orders/components/order-amounts';
import { useI18n } from '@/i18n/i18n-provider';
import type { Controller } from '@/features/checkout/hooks/use-checkout';

export function OrderConfirmation(c: Controller) {
  const { isArabic } = useI18n();
  const label = (en: string, ar: string) => (isArabic ? ar : en);
  const needsReceipt = c.order?.status === 'awaiting_receipt';
  const sending = c.busy && !c.confirmationOpen;
  const close = () => {
    if (needsReceipt) c.setOrder(null);
    else c.dismissConfirmation();
  };
  const message = !c.order
    ? ''
    : c.order.status === 'payment_rejected'
      ? label(
          'We could not confirm your transfer. Contact support before making another payment.',
          'لم نتمكن من تأكيد التحويل. تواصل مع الدعم قبل إجراء أي تحويل آخر.',
        )
      : c.order.status === 'cancelled'
        ? label(
            'This order was cancelled. Contact support if you already paid.',
            'تم إلغاء هذا الطلب. تواصل مع الدعم إذا كنت قد دفعت بالفعل.',
          )
        : c.order.payment_method === 'instapay'
          ? c.order.status === 'awaiting_payment_verification'
            ? label(
                'We received your receipt. The Founder will verify the actual transfer before confirming payment and sending your order to the cashier.',
                'استلمنا الإيصال. هنراجع وصول التحويل الفعلي قبل تأكيد الدفع وإرسال طلبك للكاشير.',
              )
            : label(
                'Your payment is confirmed and your order has been sent to the cashier.',
                'تم تأكيد الدفع وإرسال طلبك للكاشير.',
              )
          : c.order.fulfillment === 'delivery'
            ? label(
                'Your order has been sent to the cashier. Please pay on delivery.',
                'تم إرسال طلبك للكاشير. الدفع عند التوصيل.',
              )
            : label(
                'Your order has been sent to the cashier. Please pay at the café.',
                'تم إرسال طلبك للكاشير. الدفع في الكافيه.',
              );

  return (
    <Dialog
      open={sending || c.confirmationOpen || needsReceipt}
      dismissible={!c.busy}
      onClose={close}
      title={
        sending
          ? label('Sending your order…', 'جاري إرسال طلبك…')
          : needsReceipt
            ? label('Finish sending your receipt', 'إكمال إرسال الإيصال')
            : label(
                `Thank you — order #${c.order?.number}`,
                `شكرًا لك — الطلب #${c.order?.number}`,
              )
      }
    >
      {sending ? (
        <p role="status">
          {label(
            'Please wait while we save your order and receipt.',
            'لحظات، بنحفظ طلبك والإيصال.',
          )}
        </p>
      ) : needsReceipt ? (
        <>
          <p>
            {label(
              `Order #${c.order.number} is saved. Retry the receipt upload; do not transfer again.`,
              `الطلب #${c.order.number} محفوظ. أعد رفع الإيصال فقط؛ لا تحوّل المبلغ مرة أخرى.`,
            )}
          </p>
          {c.error && (
            <p role="alert" className="text-red-700">
              {c.error.replaceAll('_', ' ')}
            </p>
          )}
          <ImageUpload
            file={c.receiptFile}
            disabled={c.busy}
            onChange={c.setReceiptFile}
            onInvalid={c.setError}
            title={label(
              'Select your transfer receipt',
              'اختر صورة إيصال التحويل',
            )}
          />
          <button
            className="button mt-4"
            disabled={c.busy || !c.receiptFile}
            onClick={() => c.run(() => c.uploadReceipt())}
          >
            {label('Retry receipt upload', 'إعادة رفع الإيصال')}
          </button>
        </>
      ) : (
        c.order && (
          <>
            <p className="eyebrow">
              {label('Keep your order number', 'احتفظ برقم طلبك')}
            </p>
            <strong className="block text-4xl text-bareeq-burgundy">
              #{c.order.number}
            </strong>
            <OrderAmounts
              itemsMinor={c.order.total_minor - (c.order.delivery_minor ?? 0)}
              deliveryMinor={c.order.delivery_minor ?? 0}
              totalMinor={c.order.total_minor}
            />
            {c.order.delivery_address && (
              <p className="whitespace-pre-wrap">
                {label('Delivery address: ', 'عنوان التوصيل: ')}
                {c.order.delivery_address}
              </p>
            )}
            <p>{message}</p>
            <p>
              {label(
                'Need help with your order? Call ',
                'لأي استفسار عن طلبك، اتصل على ',
              )}
              <a className="underline" href="tel:01018652532" dir="ltr">
                01018652532
              </a>
              {label(
                ` and mention order #${c.order.number}.`,
                ` واذكر رقم الطلب #${c.order.number}.`,
              )}
            </p>
            <button className="button" onClick={close}>
              {label('Done', 'تمام')}
            </button>
          </>
        )
      )}
    </Dialog>
  );
}

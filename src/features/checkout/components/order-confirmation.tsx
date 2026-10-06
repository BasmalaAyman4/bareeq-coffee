import { Dialog } from '@/components/ui/modal';
import { ImageUpload } from '@/components/ui/image-upload';
import type { Controller } from '@/features/checkout/hooks/use-checkout';
import { money } from '@/lib/money';

export function OrderConfirmation({
  order,
  busy,
  receiptFile,
  setReceiptFile,
  setError,
  run,
  uploadReceipt,
  confirmationOpen,
  dismissConfirmation,
}: Controller) {
  const needsReceipt = order.status === 'awaiting_receipt';
  return (
    <>
      {needsReceipt && (
        <section className="checkout-panel">
          <h2>Finish order #{order.number}</h2>
          <p>
            Your order is saved. Upload the receipt to finish submitting it. Do
            not transfer again.
          </p>
          <ImageUpload
            file={receiptFile}
            disabled={busy}
            onChange={setReceiptFile}
            onInvalid={setError}
            title="Select your transfer receipt"
          />
          <button
            className="button mt-4"
            disabled={busy || !receiptFile}
            onClick={() => run(() => uploadReceipt())}
          >
            {busy ? 'Uploading receipt…' : 'Submit receipt'}
          </button>
        </section>
      )}
      <Dialog
        open={confirmationOpen}
        title={`Thank you — order #${order.number}`}
        onClose={dismissConfirmation}
      >
        <p className="eyebrow">Keep your order number</p>
        <strong className="block text-4xl text-bareeq-burgundy">
          #{order.number}
        </strong>
        <p>Total: {money(order.total_minor)}</p>
        <p>
          {order.status === 'payment_rejected'
            ? 'We could not confirm your transfer. Please contact support with your order number before making another payment.'
            : order.status === 'cancelled'
              ? 'This order was cancelled. Contact support if you have already transferred payment.'
              : order.payment_method === 'instapay' &&
                  order.status !== 'awaiting_payment_verification'
                ? 'Your payment has been confirmed and your order has been sent to the cashier.'
                : order.payment_method === 'instapay'
                  ? 'We received your receipt. The Founder will check the actual incoming transfer before confirming payment and sending your order to the cashier.'
                  : 'Your order has been sent to the cashier. Please pay when collecting your order.'}
        </p>
        <p>
          Need help or want to explain something about your order? Call{' '}
          <a className="underline" href="tel:01018652532">
            01018652532
          </a>{' '}
          and mention order #{order.number}.
        </p>
        <button className="button" onClick={dismissConfirmation}>
          Done
        </button>
      </Dialog>
    </>
  );
}

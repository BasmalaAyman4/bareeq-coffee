import { useCopy } from '@/i18n/i18n-provider';
import { CartItems } from '@/features/checkout/components/cart-items';
import { CheckoutForm } from '@/features/checkout/components/checkout-form';
import { OrderConfirmation } from '@/features/checkout/components/order-confirmation';
import { OrderSummary } from '@/features/checkout/components/order-summary';
import { ResumeOrder } from '@/features/checkout/components/resume-order';
import { useCheckout } from '@/features/checkout/hooks/use-checkout';
import Link from '@/router';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
export function CartPage({
  checkout = false,
  staff = false,
}: {
  checkout?: boolean;
  staff?: boolean;
}) {
  const tr = useCopy();

  const controller = useCheckout({ checkout, staff });
  const { cart, order, pending, error, busy } = controller;
  return (
    <div className="wrap page-content">
      <div className="page-heading">
        <p className="eyebrow">
          {staff
            ? tr('Counter order')
            : checkout
              ? tr('Checkout')
              : tr('Your bag')}
        </p>
        <h1>
          {order
            ? tr('Your Bareeq order.')
            : checkout
              ? tr('One step closer.')
              : tr('Your Bareeq order.')}
        </h1>
      </div>
      {error && !order && (
        <p className="backend-notice" role="alert">
          {error.replaceAll('_', ' ')}
        </p>
      )}
      {pending && !order && !busy ? (
        <ResumeOrder {...controller} />
      ) : order || (busy && pending) ? (
        <OrderConfirmation {...controller} />
      ) : !cart.length ? (
        <div className="empty-state">
          <ShoppingBag size={44} />
          <h2>{tr('A little empty, a lot of possibilities.')}</h2>
          <Link className="button" href="/menu">
            {tr('Explore the menu')}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <CartItems {...controller} />
            {(checkout || staff) && <CheckoutForm {...controller} />}
          </div>
          <OrderSummary {...controller} />
        </div>
      )}
    </div>
  );
}

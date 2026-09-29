import { Picture, Quantity, price } from '@/components/products';
import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import products from '@/data/products.json';
import site from '@/data/site.json';
import Link from '@/router';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  MessageCircle,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
export function CartPage({ checkout = false }: { checkout?: boolean }) {
  const { cart, quantity } = useCart();
  const [step, setStep] = useState<'details' | 'review'>('details');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const lines = cart.map((l) => ({
    ...l,
    product: products.find((p) => p.id === l.id)!,
  }));
  const total = lines.reduce(
    (n, l) => n + (l.product.price || 0) * l.quantity,
    0,
  );
  const canOrder = lines.every(
    (l) => l.product.available && l.product.price !== null,
  );
  const message = [
    'Hello Bareeq, I would like to confirm this order:',
    'Name: ' + name,
    ...lines.map(
      (l) =>
        `${l.quantity} × ${l.product.name} — ${price(l.product.price === null ? null : l.product.price * l.quantity)}`,
    ),
    'Menu subtotal: ' + price(total),
    'Please confirm currency, availability, collection/delivery and final total.',
    note ? 'Notes: ' + note : '',
  ]
    .filter(Boolean)
    .join('\n');
  if (!lines.length)
    return (
      <div className="wrap page-content empty-state">
        <ShoppingBag size={44} />
        <p className="eyebrow">Your bag</p>
        <h1>
          A little empty,
          <br />a lot of possibilities.
        </h1>
        <p>Find something to brighten your day.</p>
        <Link className="button" href="/menu">
          Explore the menu <ArrowUpRight size={18} />
        </Link>
      </div>
    );
  return (
    <div className="wrap page-content">
      <div className="page-heading">
        <p className="eyebrow">{checkout ? 'Checkout' : 'Your bag'}</p>
        <h1>{checkout ? 'One step closer.' : 'Your Bareeq order.'}</h1>
      </div>
      <div className="cart-layout">
        <div>
          {!checkout ? (
            <div className="cart-items">
              {lines.map((l) => (
                <article className="cart-item" key={l.id}>
                  <Link
                    className="cart-image"
                    href={'/product/' + l.product.slug}
                  >
                    <Picture product={l.product} />
                  </Link>
                  <div className="cart-item-name">
                    <Link href={'/product/' + l.product.slug}>
                      <h2>{l.product.name}</h2>
                    </Link>
                    <p>{price(l.product.price)}</p>
                    {!l.product.available && (
                      <p>Currently unavailable — please remove.</p>
                    )}
                    <Button
                      className="remove-button"
                      variant="ghost"
                      aria-label={'Remove ' + l.product.name}
                      onClick={() => quantity(l.id, 0)}
                    >
                      <Trash2 size={14} /> Remove
                    </Button>
                  </div>
                  <Quantity
                    name={l.product.name + ' quantity'}
                    value={l.quantity}
                    onChange={(q) => quantity(l.id, q)}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="checkout-panel">
              <div className="checkout-steps">
                <span className={step === 'details' ? 'current' : ''}>
                  01 · Your details
                </span>
                <span className={step === 'review' ? 'current' : ''}>
                  02 · Review
                </span>
              </div>
              {step === 'details' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep('review');
                  }}
                >
                  <h2>How should we address you?</h2>
                  <label>
                    Your name
                    <input
                      name="name"
                      autoComplete="given-name"
                      required
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label>
                    Order notes <span>(optional)</span>
                    <textarea
                      maxLength={500}
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>
                  <p className="small-note">
                    Review your order here, then open a message to Bareeq on
                    WhatsApp. The café will confirm availability, currency,
                    fulfillment and the final amount. No payment is taken on
                    this website.
                  </p>
                  <Button className="button" type="submit" disabled={!canOrder}>
                    Review order <ArrowUpRight size={18} />
                  </Button>
                </form>
              ) : (
                <div className="order-review">
                  <h2>Ready to check with Bareeq?</h2>
                  <p>For {name}</p>
                  <ul>
                    {lines.map((l) => (
                      <li key={l.id}>
                        <span>
                          {l.quantity} × {l.product.name}
                        </span>
                        <strong>
                          {price((l.product.price || 0) * l.quantity)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                  {note && <p className="review-note">{note}</p>}
                  <p>
                    Your order is not placed yet. Opening WhatsApp prepares a
                    message for you to review and send.
                  </p>
                  <a
                    href={
                      'https://wa.me/' +
                      site.whatsapp.replace(/\D/g, '') +
                      '?text=' +
                      encodeURIComponent(message)
                    }
                    className="button"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open order in WhatsApp <MessageCircle size={18} />
                  </a>
                  <Button
                    className="text-link"
                    variant="ghost"
                    onClick={() => setStep('details')}
                  >
                    <ArrowLeft size={16} />
                    Edit details
                  </Button>
                </div>
              )}
            </div>
          )}
          <Link
            className="text-link continue-shopping"
            href={checkout ? '/cart' : '/menu'}
          >
            <ArrowLeft size={16} />
            {checkout ? 'Back to bag' : 'Continue exploring'}
          </Link>
        </div>
        <aside className="order-summary">
          <h2>Order summary</h2>
          <dl>
            <div>
              <dt>Items</dt>
              <dd>{lines.reduce((n, l) => n + l.quantity, 0)}</dd>
            </div>
            <div>
              <dt>Menu subtotal</dt>
              <dd>{price(total)}</dd>
            </div>
            <div>
              <dt>Delivery / collection</dt>
              <dd>Confirm with café</dd>
            </div>
            <div className="summary-total">
              <dt>Final total</dt>
              <dd>To be confirmed</dd>
            </div>
          </dl>
          <p>
            Prices are from Bareeq’s published menu. Currency, availability and
            any delivery charges are confirmed directly by the café.
          </p>
          {!canOrder && (
            <p role="alert">Remove unavailable items before continuing.</p>
          )}
          {!checkout && (
            <Link
              href={canOrder ? '/checkout' : '/cart'}
              className="button light"
              aria-disabled={!canOrder}
            >
              Review checkout <ArrowUpRight size={18} />
            </Link>
          )}
          <span className="secure-note">
            <Check size={16} /> No payment taken here
          </span>
        </aside>
      </div>
    </div>
  );
}

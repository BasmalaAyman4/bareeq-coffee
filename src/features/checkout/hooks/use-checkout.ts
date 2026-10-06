import { useCart } from '@/features/cart/hooks/use-cart';
import { useMenu, useProducts } from '@/features/catalog/hooks/use-menu';
import { PENDING, secret } from '@/features/checkout/model';
import { api } from '@/services/api';
import { useEffect, useRef, useState } from 'react';
export function useCheckout({
  checkout = false,
  staff = false,
}: {
  checkout?: boolean;
  staff?: boolean;
}) {
  const { cart, quantity, clear } = useCart(),
    products = useProducts(),
    menu = useMenu();
  const [name, setName] = useState(''),
    [phone, setPhone] = useState(''),
    [notes, setNotes] = useState(''),
    [branch, setBranch] = useState(''),
    [method, setMethod] = useState('cash'),
    [fulfillment, setFulfillment] = useState('takeaway');
  const [quote, setQuote] = useState<any>(null),
    [order, setOrder] = useState<any>(null),
    [pending, setPending] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  const selectedBranch = branch || menu.data?.branches[0]?.id || '';
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PENDING);
      if (saved) {
        const pending = JSON.parse(saved);
        setPending(pending);
        const p = pending.order;
        setName(p.customer_name ?? '');
        setPhone(p.phone ?? '');
        setNotes(p.notes ?? '');
        setBranch(p.branch_id ?? '');
        setMethod(p.payment_method ?? 'cash');
        setFulfillment(p.fulfillment ?? 'takeaway');
      }
    } catch {}
  }, []);
  const lines = cart.map((l) => ({
    ...l,
    product: products.find((p) => p.id === l.id),
  }));
  const subtotal = lines.reduce((sum, l) => {
    const p = l.product;
    return (
      sum +
      l.quantity *
        ((p?.variants.find((v) => v.id === l.variant_id)?.price_minor ??
          p?.price_minor ??
          0) +
          (p?.modifiers
            .filter((m) => l.modifier_ids.includes(m.id))
            .reduce((n, m) => n + m.price_minor, 0) ?? 0))
    );
  }, 0);
  const canOrder =
    cart.length > 0 &&
    lines.every(
      (l) =>
        l.product?.available && (l.product.price !== null || !!l.variant_id),
    );
  const payload = () => ({
    branch_id: selectedBranch,
    source: staff ? 'cashier' : 'web',
    fulfillment,
    customer_name: name,
    phone,
    notes,
    payment_method: method,
    items: cart.map((l) => ({
      product_id: l.id,
      variant_id: l.variant_id,
      modifier_ids: l.modifier_ids,
      quantity: l.quantity,
    })),
  });
  async function run(fn: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to complete request. Please retry.',
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  async function submit(saved: any) {
    const result = await api('create', saved);
    if (result.price_changed) {
      setQuote(result.quote);
      setPending(null);
      localStorage.removeItem(PENDING);
      setError('The menu changed. Review the updated total and confirm again.');
      return;
    }
    const next = { ...saved, id: result.id };
    setPending(next);
    setOrder(result);
    try {
      localStorage.setItem(PENDING, JSON.stringify(next));
    } catch {}
    clear();
  }
  function place() {
    run(async () => {
      const saved = {
        order: { ...payload(), quote_hash: quote.quote_hash },
        key: crypto.randomUUID(),
        token: secret(),
      };
      // Persist before sending; retries after a crash reuse the same request and key.
      try {
        localStorage.setItem(PENDING, JSON.stringify(saved));
      } catch {
        throw new Error(
          'Browser storage is unavailable. Enable it before placing an order so retries remain safe.',
        );
      }
      setPending(saved);
      await submit(saved);
    });
  }
  const hasReceipt = order && !['awaiting_receipt'].includes(order.status);

  return {
    checkout,
    staff,
    cart,
    quantity,
    clear,
    products,
    menu,
    name,
    setName,
    phone,
    setPhone,
    notes,
    setNotes,
    branch,
    setBranch,
    method,
    setMethod,
    fulfillment,
    setFulfillment,
    quote,
    setQuote,
    order,
    setOrder,
    pending,
    setPending,
    busy,
    setBusy,
    error,
    setError,
    lock,
    selectedBranch,
    lines,
    subtotal,
    canOrder,
    payload,
    run,
    submit,
    place,
    hasReceipt,
  };
}
export type Controller = ReturnType<typeof useCheckout>;

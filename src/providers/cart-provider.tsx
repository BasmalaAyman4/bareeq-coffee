import { cartStore } from '@/features/cart/cart-store';
import { useEffect, type ReactNode } from 'react';
export function CartProvider({ children }: { children: ReactNode }) {
  const notice = cartStore((s) => s.notice);
  useEffect(() => {
    try {
      const raw = JSON.parse(
        localStorage.getItem('bareeq-cart-v2') ??
          localStorage.getItem('bareeq-cart-v1') ??
          '[]',
      );
      if (Array.isArray(raw))
        cartStore.getState().setCart(
          raw
            .slice(0, 50)
            .filter(
              (x) =>
                typeof x.id === 'string' &&
                Number.isInteger(x.quantity) &&
                x.quantity > 0,
            )
            .map((x) => ({
              key: x.key ?? x.id + ':',
              id: x.id,
              quantity: Math.min(x.quantity, 99),
              variant_id:
                typeof x.variant_id === 'string' ? x.variant_id : null,
              modifier_ids: Array.isArray(x.modifier_ids)
                ? x.modifier_ids
                    .filter((v: unknown) => typeof v === 'string')
                    .slice(0, 12)
                : [],
            })),
        );
    } catch {}
    return cartStore.subscribe((s) => {
      try {
        localStorage.setItem('bareeq-cart-v2', JSON.stringify(s.cart));
      } catch {}
    });
  }, []);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => cartStore.getState().setNotice(''), 3500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  return children;
}

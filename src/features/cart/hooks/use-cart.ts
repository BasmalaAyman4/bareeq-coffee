import { useProducts } from '@/features/catalog/hooks/use-menu';
import { cartStore } from '../cart-store';
export function useCart() {
  const s = cartStore();
  const products = useProducts();
  return {
    ...s,
    add: (
      id: string,
      amount = 1,
      variant_id: string | null = null,
      modifier_ids: string[] = [],
    ) => {
      const p = products.find((x) => x.id === id);
      if (!p?.available || !Number.isInteger(amount) || amount < 1) return;
      if (p.variants.length && !variant_id) {
        window.location.assign('/product/' + p.slug);
        return;
      }
      const key = [id, variant_id ?? '', ...modifier_ids.slice().sort()].join(
        ':',
      );
      const current = cartStore.getState().cart;
      s.setCart(
        current.some((x) => x.key === key)
          ? current.map((x) =>
              x.key === key
                ? { ...x, quantity: Math.min(99, x.quantity + amount) }
                : x,
            )
          : [
              ...current,
              {
                key,
                id,
                quantity: Math.min(99, amount),
                variant_id,
                modifier_ids,
              },
            ],
      );
      s.setNotice(p.name + ' added to your bag.');
    },
    quantity: (key: string, amount: number) => {
      if (Number.isInteger(amount))
        s.setCart(
          cartStore
            .getState()
            .cart.flatMap((x) =>
              x.key === key
                ? amount > 0
                  ? [{ ...x, quantity: Math.min(99, amount) }]
                  : []
                : [x],
            ),
        );
    },
  };
}

import products from '@/data/products.json';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type CartLine = { id: string; quantity: number };
type CartContextValue = {
  cart: CartLine[];
  add: (id: string, amount?: number) => void;
  quantity: (id: string, amount: number) => void;
  notice: string;
};

const STORAGE_KEY = 'bareeq-cart-v1';
const MAX_QUANTITY = 99;
const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used inside CartProvider');
  return cart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  // Start empty for server rendering, then restore and validate browser storage.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) {
        const validLines = new Map<string, number>();
        for (const line of saved) {
          if (
            products.some((product) => product.id === line?.id) &&
            Number.isInteger(line.quantity) &&
            line.quantity > 0
          ) {
            validLines.set(line.id, Math.min(MAX_QUANTITY, line.quantity));
          }
        }
        setCart([...validLines].map(([id, quantity]) => ({ id, quantity })));
      }
    } catch {
      // A blocked or invalid local store should not prevent shopping.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* The cart still works for this visit when storage is blocked. */
    }
  }, [cart, ready]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  function add(id: string, amount = 1) {
    const product = products.find((item) => item.id === id);
    if (!product?.available || !Number.isInteger(amount) || amount < 1) return;
    setCart((current) =>
      current.some((line) => line.id === id)
        ? current.map((line) =>
            line.id === id
              ? {
                  ...line,
                  quantity: Math.min(MAX_QUANTITY, line.quantity + amount),
                }
              : line,
          )
        : [...current, { id, quantity: Math.min(MAX_QUANTITY, amount) }],
    );
    setNotice(product.name + ' added to your bag.');
  }

  function quantity(id: string, amount: number) {
    if (!Number.isInteger(amount)) return;
    setCart((current) =>
      amount <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) =>
            line.id === id
              ? { ...line, quantity: Math.min(MAX_QUANTITY, amount) }
              : line,
          ),
    );
  }

  return (
    <CartContext.Provider value={{ cart, add, quantity, notice }}>
      {children}
    </CartContext.Provider>
  );
}

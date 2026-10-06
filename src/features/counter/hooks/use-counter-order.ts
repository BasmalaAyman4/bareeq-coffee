import { useMenu } from '@/features/catalog/hooks/use-menu';
import { CounterLine, unitPrice } from '@/features/counter/model';
import { api } from '@/services/api';
import { type Product } from '@/types/catalog';
import { useEffect, useMemo, useRef, useState } from 'react';
export function useCounterOrder() {
  const menu = useMenu();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [lines, setLines] = useState<CounterLine[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [modifierIds, setModifierIds] = useState<string[]>([]);
  const [payment, setPayment] = useState<'cash' | 'card'>('cash');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const pendingSubmission = useRef<{
    signature: string;
    key: string;
    token: string;
  } | null>(null);
  const branchId = menu.data?.branches[0]?.id ?? '';

  useEffect(() => {
    if (!selected) return;
    setVariantId(
      selected.variants.find((variant) => variant.available)?.id ?? null,
    );
    setModifierIds([]);
  }, [selected]);

  const products = useMemo(
    () =>
      (menu.data?.products ?? []).filter((product) => {
        const availableAtBranch = menu.data?.availability.find(
          (row) => row.branch_id === branchId && row.product_id === product.id,
        );
        return (
          product.active &&
          product.available &&
          availableAtBranch?.available !== false &&
          (category === 'all' || product.category_id === category) &&
          `${product.name} ${product.category}`
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }),
    [branchId, category, menu.data, search],
  );
  const total = lines.reduce(
    (sum, line) => sum + unitPrice(line) * line.quantity,
    0,
  );
  const setQuantity = (key: string, quantity: number) =>
    setLines((current) =>
      current.flatMap((line) =>
        line.key === key
          ? quantity > 0
            ? [{ ...line, quantity: Math.min(99, quantity) }]
            : []
          : [line],
      ),
    );
  const addLine = (
    product: Product,
    selectedVariantId: string | null,
    selectedModifierIds: string[],
  ) => {
    const key = [
      product.id,
      selectedVariantId ?? '',
      ...selectedModifierIds.slice().sort(),
    ].join(':');
    setLines((current) => {
      const existing = current.find((line) => line.key === key);
      return existing
        ? current.map((line) =>
            line.key === key
              ? { ...line, quantity: Math.min(99, line.quantity + 1) }
              : line,
          )
        : [
            ...current,
            {
              key,
              product,
              variantId: selectedVariantId,
              modifierIds: selectedModifierIds,
              quantity: 1,
            },
          ];
    });
  };
  const add = () => {
    if (!selected || (selected.variants.length > 0 && !variantId)) return;
    addLine(selected, variantId, modifierIds);
    setSelected(null);
  };
  const openProduct = (product: Product) => {
    if (!product.variants.length && !product.modifiers.length) {
      addLine(product, null, []);
      return;
    }
    setSelected(product);
  };
  const createOrder = async () => {
    if (!lines.length || !branchId || busy) return;
    setBusy(true);
    setMessage('');
    const order = {
      branch_id: branchId,
      source: 'cashier',
      // Legacy backend compatibility: the deployed server maps this to a
      // counter sale as soon as the matching migration is applied.
      fulfillment: 'takeaway',
      // This is an internal snapshot required by the order record. The
      // cashier never enters it and customers do not see a name field.
      customer_name: 'Walk-in customer',
      phone: '',
      notes: '',
      payment_method: payment,
      items: lines.map((line) => ({
        product_id: line.product.id,
        variant_id: line.variantId,
        modifier_ids: line.modifierIds,
        quantity: line.quantity,
      })),
    };
    try {
      const quote = await api<any>('quote', { order });
      const signature = JSON.stringify(order);
      const retry = pendingSubmission.current;
      const request =
        retry?.signature === signature
          ? retry
          : {
              signature,
              key: crypto.randomUUID(),
              token: Array.from(
                crypto.getRandomValues(new Uint8Array(32)),
                (byte) => byte.toString(16).padStart(2, '0'),
              ).join(''),
            };
      pendingSubmission.current = request;
      const result = await api<any>('create', {
        order: { ...order, quote_hash: quote.quote_hash },
        key: request.key,
        token: request.token,
      });
      if (result.price_changed) {
        pendingSubmission.current = null;
        setMessage(
          'A menu price changed. Please review the updated total and press Pay again.',
        );
        return;
      }
      setLines([]);
      pendingSubmission.current = null;
      setMessage(`Order #${result.number} is now in the active queue.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message.replaceAll('_', ' ')
          : 'Unable to create order.',
      );
    } finally {
      setBusy(false);
    }
  };

  return {
    menu,
    category,
    setCategory,
    search,
    setSearch,
    lines,
    setLines,
    selected,
    setSelected,
    variantId,
    setVariantId,
    modifierIds,
    setModifierIds,
    payment,
    setPayment,
    busy,
    setBusy,
    message,
    setMessage,
    pendingSubmission,
    branchId,
    products,
    total,
    setQuantity,
    addLine,
    add,
    openProduct,
    createOrder,
  };
}
export type Controller = ReturnType<typeof useCounterOrder>;

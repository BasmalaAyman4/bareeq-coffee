import { CounterCart } from '@/features/counter/components/counter-cart';
import { CounterMenu } from '@/features/counter/components/counter-menu';
import { CounterProductOptions } from '@/features/counter/components/counter-product-options';
import { useCounterOrder } from '@/features/counter/hooks/use-counter-order';
export function CounterOrder() {
  const controller = useCounterOrder();
  return (
    <section className="grid min-h-[calc(100vh-15rem)] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <CounterMenu {...controller} />

      <CounterCart {...controller} />

      <CounterProductOptions {...controller} />
    </section>
  );
}

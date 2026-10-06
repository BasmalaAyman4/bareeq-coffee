import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
export function Quantity({
  value,
  onChange,
  name = 'quantity',
}: {
  value: number;
  onChange: (n: number) => void;
  name?: string;
}) {
  return (
    <div className="quantity">
      <Button
        className="quantity-button"
        variant="ghost"
        aria-label={'Decrease ' + name}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} />
      </Button>
      <output aria-label={name}>{value}</output>
      <Button
        className="quantity-button"
        variant="ghost"
        aria-label={'Increase ' + name}
        disabled={value >= 99}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}

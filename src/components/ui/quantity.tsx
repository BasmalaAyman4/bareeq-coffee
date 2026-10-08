import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useCopy } from '@/i18n/i18n-provider';
export function Quantity({
  value,
  onChange,
  name = 'quantity',
}: {
  value: number;
  onChange: (n: number) => void;
  name?: string;
}) {
  const tr = useCopy();
  return (
    <div className="quantity">
      <Button
        className="quantity-button"
        variant="ghost"
        aria-label={tr('Decrease') + ' ' + tr(name)}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} />
      </Button>
      <output aria-label={tr(name)}>{value}</output>
      <Button
        className="quantity-button"
        variant="ghost"
        aria-label={tr('Increase') + ' ' + tr(name)}
        disabled={value >= 99}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}

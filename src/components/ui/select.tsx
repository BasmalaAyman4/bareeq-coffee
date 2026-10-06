import { cn } from '@/lib/utils';
import { type SelectHTMLAttributes } from 'react';

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        '!mb-0 !mt-0 h-11 w-full rounded-xl !border !border-bareeq-espresso/20 !bg-white px-3.5 text-sm text-bareeq-espresso shadow-[inset_0_1px_1px_rgba(33,22,19,0.03)] outline-none transition hover:!border-bareeq-burgundy/35 focus:!border-bareeq-burgundy focus:ring-4 focus:ring-bareeq-burgundy/10 disabled:cursor-not-allowed disabled:!bg-bareeq-cream/40',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

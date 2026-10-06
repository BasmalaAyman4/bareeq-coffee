import { cn } from '@/lib/utils';
import { type TextareaHTMLAttributes } from 'react';

export function TextArea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        '!mb-0 !mt-0 min-h-28 w-full resize-y rounded-xl !border !border-bareeq-espresso/20 !bg-white px-3.5 py-3 text-sm text-bareeq-espresso shadow-[inset_0_1px_1px_rgba(33,22,19,0.03)] outline-none transition placeholder:text-bareeq-espresso/40 hover:!border-bareeq-burgundy/35 focus:!border-bareeq-burgundy focus:ring-4 focus:ring-bareeq-burgundy/10 disabled:cursor-not-allowed disabled:!bg-bareeq-cream/40',
        className,
      )}
      {...props}
    />
  );
}

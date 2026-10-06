import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
  dir?: 'ltr' | 'rtl';
};
export function Field({
  label,
  hint,
  error,
  children,
  className = '',
  dir,
}: FieldProps) {
  return (
    <label
      className={cn(
        'flex min-w-0 flex-col gap-1.5 text-sm font-semibold text-bareeq-espresso',
        className,
      )}
      dir={dir}
    >
      {label && <span>{label}</span>}
      {children}
      {error ? (
        <span className="text-xs font-medium text-red-700" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs font-normal leading-5 text-bareeq-espresso/65">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

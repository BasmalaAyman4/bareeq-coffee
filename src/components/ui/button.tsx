import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-bareeq-gold/45 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-bareeq-burgundy text-bareeq-ivory hover:bg-bareeq-wine',
        destructive:
          'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700/20',
        outline:
          'border border-bareeq-burgundy/35 bg-transparent text-bareeq-burgundy hover:bg-bareeq-blush/40',
        secondary: 'bg-bareeq-cream text-bareeq-burgundy hover:bg-bareeq-blush',
        ghost: 'text-bareeq-burgundy hover:bg-bareeq-blush/45',
        link: 'text-bareeq-burgundy underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

import type { ButtonHTMLAttributes } from 'react';
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'quiet' | 'danger';
  loading?: boolean;
};
export function UIButton({
  className = '',
  tone = 'primary',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const tones = {
    primary:
      'border-bareeq-burgundy bg-bareeq-burgundy text-bareeq-ivory hover:border-bareeq-wine hover:bg-bareeq-wine focus:ring-bareeq-burgundy/25',
    secondary:
      'border border-bareeq-burgundy/25 bg-bareeq-ivory text-bareeq-burgundy hover:bg-bareeq-blush/35 focus:ring-bareeq-burgundy/15',
    quiet:
      'bg-transparent text-bareeq-burgundy hover:bg-bareeq-blush/45 focus:ring-bareeq-burgundy/15',
    danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-700/20',
  };
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border-none px-4 py-2.5 text-sm font-bold transition focus:outline-none focus:ring-4 disabled:pointer-events-none disabled:opacity-55',
        tones[tone],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

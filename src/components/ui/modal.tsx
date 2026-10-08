import { useCopy } from '@/i18n/i18n-provider';
import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { UIButton } from './button';
export type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  dismissible?: boolean;
};
export function Dialog({
  open,
  title,
  children,
  onClose,
  footer,
  dismissible = true,
}: DialogProps) {
  const tr = useCopy();

  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) onClose();
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open, onClose, dismissible]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-bareeq-espresso/55 p-4 backdrop-blur-sm"
      onMouseDown={dismissible ? onClose : undefined}
    >
      <section
        className="max-h-[min(90vh,52rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-bareeq-ivory shadow-bareeq"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-bareeq-espresso/12 bg-bareeq-ivory px-6 py-5">
          <h2 className="text-xl font-bold text-bareeq-espresso" id={titleId}>
            {title}
          </h2>
          {dismissible && (
            <UIButton
              tone="quiet"
              className="min-h-0 rounded-full p-2 text-xl leading-none border-none"
              onClick={onClose}
              aria-label={tr('Close dialog')}
            >
              ×
            </UIButton>
          )}
        </header>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-3 border-t border-bareeq-espresso/12 px-6 py-4">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  );
}

import { UIButton } from '@/components/ui/button';
import { Dialog } from '@/components/ui/modal';

import type { Controller } from '@/features/catalog/hooks/use-menu-editor';
export function DeleteProductModal({
  deleting,
  setDeleting,
  error,
  busy,
  deleteProduct,
}: Pick<
  Controller,
  'deleting' | 'setDeleting' | 'error' | 'busy' | 'deleteProduct'
>) {
  return (
    <Dialog
      open={!!deleting}
      title="Delete product?"
      onClose={() => {
        if (!busy) setDeleting(null);
      }}
      footer={
        <>
          <UIButton
            tone="secondary"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Keep product
          </UIButton>
          <UIButton
            disabled={busy}
            loading={busy}
            onClick={() => void deleteProduct()}
          >
            Delete product
          </UIButton>
        </>
      }
    >
      <p className="text-sm leading-6 text-bareeq-espresso/75">
        Delete <strong>{deleting?.name}</strong> from the menu? It will no
        longer appear on the website or counter menu. Past orders and reports
        will be kept.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </Dialog>
  );
}

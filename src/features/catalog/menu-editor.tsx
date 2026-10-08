import { useCopy } from '@/i18n/i18n-provider';
import { UIButton } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/table';
import { DeleteProductModal } from '@/features/catalog/components/delete-product-modal';
import { ProductEditorModal } from '@/features/catalog/components/product-editor-modal';
import { money } from '@/lib/money';
import { type Product } from '@/types/catalog';
import { Eye, Search, Trash2 } from 'lucide-react';

import { useMenuEditor } from '@/features/catalog/hooks/use-menu-editor';
import { useI18n } from '@/i18n/i18n-provider';
import { catalogLabel } from '@/i18n/catalog-label';
export function MenuEditor() {
  const tr = useCopy();

  const { language } = useI18n();
  const controller = useMenuEditor();
  const {
    setDeleting,
    setEdit,
    error,
    setError,
    setImageFile,
    search,
    setSearch,
    setPage,
    pageSize,
    filteredProducts,
    totalPages,
    currentPage,
    pageProducts,
    blankProduct,
    editProduct,
  } = controller;
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-bareeq-espresso/10 bg-bareeq-ivory p-5 shadow-sm">
        <div>
          <p className="eyebrow !mb-1">{tr('Website menu')}</p>
          <h2 className="!m-0 text-2xl">{tr('Products')}</h2>
          <p className="mt-2 text-sm text-bareeq-espresso/60">
            {tr('Changes here update the Bareeq website menu after saving.')}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative min-w-56">
            <Search
              className="pointer-events-none absolute left-3 top-1/4 -translate-y-1/2 text-bareeq-espresso/45"
              size={17}
            />
            <TextInput
              aria-label={tr('Search menu products')}
              className="!h-10 !pl-10"
              placeholder={tr('Search products')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <UIButton
            onClick={() => {
              setError('');
              setImageFile(null);
              setEdit(blankProduct());
            }}
          >
            {tr('Add product')}
          </UIButton>
        </div>
      </div>
      {error && (
        <p
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          role="alert"
        >
          {tr(error)}
        </p>
      )}
      <DataTable
        columns={[
          {
            key: 'product',
            header: tr('Product'),
            cell: (product: Product) => (
              <div className="flex min-w-48 items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-bareeq-cream/60">
                  {product.image ? (
                    <img
                      className="size-full object-cover"
                      src={product.image}
                      alt=""
                    />
                  ) : (
                    '☕'
                  )}
                </div>
                <div>
                  <strong className="block">
                    {catalogLabel(product, language)}
                  </strong>
                  <span className="text-xs text-bareeq-espresso/55">
                    {product.slug}
                  </span>
                </div>
              </div>
            ),
          },
          {
            key: 'category',
            header: tr('Category'),
            cell: (product: Product) =>
              language === 'ar' && product.category_ar
                ? product.category_ar
                : product.category,
          },
          {
            key: 'price',
            header: tr('Price'),
            align: 'end',
            cell: (product: Product) =>
              product.price_minor === null ? '—' : money(product.price_minor),
          },
          {
            key: 'availability',
            header: tr('Availability'),
            cell: (product: Product) => (
              <StatusBadge
                tone={
                  product.active && product.available ? 'success' : 'warning'
                }
              >
                {product.active
                  ? product.available
                    ? tr('Available')
                    : tr('Sold out')
                  : tr('Hidden')}
              </StatusBadge>
            ),
          },
          {
            key: 'action',
            header: tr('Action'),
            align: 'end',
            cell: (product: Product) => (
              <div className="flex justify-end gap-2">
                <UIButton
                  tone="secondary"
                  className="!min-h-9 !rounded-lg !px-3 !py-1.5"
                  onClick={() => {
                    setError('');
                    editProduct(product);
                  }}
                >
                  <Eye size={15} /> {tr('View / edit')}
                </UIButton>
                <UIButton
                  tone="secondary"
                  className="!min-h-9 !rounded-lg !px-2.5 !py-1.5 !text-red-700 hover:!bg-red-50"
                  aria-label={`Delete ${product.name}`}
                  title={tr('Delete product')}
                  onClick={() => {
                    setError('');
                    setDeleting(product);
                  }}
                >
                  <Trash2 size={16} />
                </UIButton>
              </div>
            ),
          },
        ]}
        rows={pageProducts}
        empty={
          search
            ? tr('No products match this search.')
            : tr('No products yet. Add your first menu product.')
        }
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-bareeq-espresso/65">
        <span>
          {filteredProducts.length
            ? `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredProducts.length)} of ${filteredProducts.length} products`
            : tr('No products to show')}
        </span>
        <div className="flex items-center gap-2">
          <UIButton
            tone="secondary"
            className="!min-h-9 !rounded-lg !px-3 !py-1.5"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            {tr('Previous')}
          </UIButton>
          <span className="min-w-20 text-center text-xs font-bold text-bareeq-espresso">
            {tr('Page')}
            {currentPage} {tr('of')}
            {totalPages}
          </span>
          <UIButton
            tone="secondary"
            className="!min-h-9 !rounded-lg !px-3 !py-1.5"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            {tr('Next')}
          </UIButton>
        </div>
      </div>
      <DeleteProductModal {...controller} />
      <ProductEditorModal {...controller} />
    </section>
  );
}

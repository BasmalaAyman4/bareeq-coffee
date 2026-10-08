import { useCopy } from '@/i18n/i18n-provider';
import { UIButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ImageUpload } from '@/components/ui/image-upload';
import { TextInput } from '@/components/ui/input';
import { Dialog } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { TextArea } from '@/components/ui/textarea';

import type { Controller } from '@/features/catalog/hooks/use-menu-editor';
export function ProductEditorModal({
  menu,
  edit,
  setEdit,
  error,
  setError,
  busy,
  uploading,
  imageFile,
  setImageFile,
  save,
  uploadImage,
}: Pick<
  Controller,
  | 'menu'
  | 'edit'
  | 'setEdit'
  | 'error'
  | 'setError'
  | 'busy'
  | 'uploading'
  | 'imageFile'
  | 'setImageFile'
  | 'save'
  | 'uploadImage'
>) {
  const tr = useCopy();

  return (
    <Dialog
      open={!!edit}
      title={edit?.name ? `Edit ${edit.name}` : tr('Add product')}
      onClose={() => {
        if (!busy && !uploading) {
          setImageFile(null);
          setEdit(null);
        }
      }}
      footer={
        <>
          <UIButton
            tone="secondary"
            type="button"
            disabled={busy || uploading}
            onClick={() => {
              setImageFile(null);
              setEdit(null);
            }}
          >
            {tr('Cancel')}
          </UIButton>
          <UIButton
            type="submit"
            form="product-editor"
            disabled={busy || uploading || !!imageFile}
            loading={busy}
          >
            {uploading ? tr('Uploading image…') : tr('Save product')}
          </UIButton>
        </>
      }
    >
      {edit && (
        <form
          id="product-editor"
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void save(edit);
          }}
        >
          {error && (
            <p
              className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="sm:col-span-2 rounded-2xl border border-bareeq-espresso/10 bg-white p-4">
            <ImageUpload
              disabled={uploading || busy}
              file={imageFile}
              previewUrl={edit.image ?? ''}
              title={
                edit.image
                  ? tr('Replace product image')
                  : tr('Upload product image')
              }
              hint="JPG, PNG or WebP · maximum 2 MB"
              onInvalid={setError}
              onChange={(file) => void uploadImage(file)}
            />
          </div>
          <Field label={tr('Product name (English)')}>
            <TextInput
              required
              value={edit.name ?? ''}
              onChange={(event) =>
                setEdit({ ...edit, name: event.target.value })
              }
            />
          </Field>
          <Field label="اسم المنتج (العربية)" dir="rtl">
            <TextInput
              value={edit.name_ar ?? ''}
              onChange={(event) =>
                setEdit({ ...edit, name_ar: event.target.value })
              }
              placeholder="اكتب اسم المنتج بالعربية"
            />
          </Field>
          <Field
            label={tr('Website link name')}
            hint="Lowercase letters, numbers, and hyphens only."
          >
            <TextInput
              required
              value={edit.slug ?? ''}
              onChange={(event) =>
                setEdit({
                  ...edit,
                  slug: event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-'),
                })
              }
            />
          </Field>
          <Field label={tr('Category')}>
            <Select
              value={edit.category_id}
              onChange={(event) =>
                setEdit({ ...edit, category_id: event.target.value })
              }
            >
              {menu.data?.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={tr('Price (EGP)')}>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={edit.price_minor === null ? '' : edit.price_minor / 100}
              onChange={(event) =>
                setEdit({
                  ...edit,
                  price_minor:
                    event.target.value === ''
                      ? null
                      : Math.round(Number(event.target.value) * 100),
                })
              }
            />
          </Field>
          <Field className="sm:col-span-2" label={tr('Description')}>
            <TextArea
              value={edit.description ?? ''}
              onChange={(event) =>
                setEdit({ ...edit, description: event.target.value })
              }
            />
          </Field>
          <Field className="sm:col-span-2" label="الوصف (العربية)" dir="rtl">
            <TextArea
              value={edit.description_ar ?? ''}
              onChange={(event) =>
                setEdit({ ...edit, description_ar: event.target.value })
              }
              placeholder="اكتب وصف المنتج بالعربية"
            />
          </Field>
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
            {[
              ['active', 'Show on website'],
              ['available', 'Available to order'],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-bareeq-espresso/12 bg-white px-4 py-3 text-sm font-bold text-bareeq-espresso"
              >
                <span>{label}</span>
                <input
                  className="size-4 accent-bareeq-burgundy"
                  type="checkbox"
                  checked={!!edit[key]}
                  onChange={(event) =>
                    setEdit({ ...edit, [key]: event.target.checked })
                  }
                />
              </label>
            ))}
          </div>
        </form>
      )}
    </Dialog>
  );
}

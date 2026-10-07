import { UIButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TextArea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { useI18n } from '@/i18n/i18n-provider';
import { api } from '@/services/api';
import { money } from '@/lib/money';
import { fieldErrorMessage, type CheckoutField } from '../validation';
import type { Controller } from '../hooks/use-checkout';
import { useState } from 'react';

export function CheckoutForm(c: Controller) {
  const { isArabic } = useI18n();
  const [uploadError, setUploadError] = useState('');
  const label = (en: string, ar: string) => (isArabic ? ar : en);
  const change = (set: (value: string) => void, value: string) => {
    set(value);
    c.setQuote(null);
  };
  const error = (field: CheckoutField) =>
    c.fieldErrors[field] ? (
      <span id={`checkout-${field}-error`}>
        {fieldErrorMessage(field, isArabic)}
      </span>
    ) : undefined;
  const accessibility = (field: CheckoutField) => ({
    name: field,
    'aria-invalid': !!c.fieldErrors[field],
    'aria-describedby': c.fieldErrors[field]
      ? `checkout-${field}-error`
      : undefined,
    className: 'aria-[invalid=true]:!border-red-600',
  });

  return (
    <section className="checkout-panel">
      <form
        ref={c.formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          c.run(async () => {
            if (!c.validateDetails()) return;
            c.setQuote(await api('quote', { order: c.payload() }));
          });
        }}
      >
        <fieldset disabled={c.busy} className="m-0 min-w-0 border-0 p-0">
          <h2>{label('Your details', 'بياناتك')}</h2>
          {c.staff && (
            <Field label={label('Branch', 'الفرع')}>
              <Select
                value={c.selectedBranch}
                onChange={(event) => {
                  change(c.setBranch, event.target.value);
                  c.setReceiptFile(null);
                }}
              >
                {c.menu.data?.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label={label('Order type', 'طريقة استلام الطلب')}>
            <Select
              value={c.fulfillment}
              onChange={(event) => change(c.setFulfillment, event.target.value)}
            >
              <option value="takeaway">
                {label('Collection from the café', 'استلام من الكافيه')}
              </option>
              {!c.staff && (
                <option value="dine_in">
                  {label('Dine-in', 'داخل الكافيه')}
                </option>
              )}
              {!c.staff && (
                <option value="delivery">
                  {label('Delivery (+ EGP 30)', 'توصيل (+30 جنيه)')}
                </option>
              )}
            </Select>
          </Field>
          <Field label={label('Name', 'الاسم')} error={error('name')}>
            <TextInput
              {...accessibility('name')}
              required={!c.staff}
              minLength={2}
              maxLength={80}
              autoComplete="name"
              value={c.name}
              onChange={(event) => change(c.setName, event.target.value)}
            />
          </Field>
          <Field label={label('Phone', 'رقم الهاتف')} error={error('phone')}>
            <TextInput
              {...accessibility('phone')}
              required={!c.staff}
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="01012345678"
              maxLength={30}
              autoComplete="tel"
              value={c.phone}
              onChange={(event) => change(c.setPhone, event.target.value)}
            />
          </Field>
          {!c.staff && c.fulfillment === 'delivery' && (
            <Field
              label={label('Delivery address', 'عنوان التوصيل')}
              error={error('address')}
            >
              <TextArea
                {...accessibility('address')}
                required
                minLength={5}
                maxLength={300}
                autoComplete="street-address"
                value={c.address}
                onChange={(event) => change(c.setAddress, event.target.value)}
                placeholder={label(
                  'Street, building, apartment, area',
                  'الشارع، رقم العمارة، الشقة، المنطقة',
                )}
              />
            </Field>
          )}
          <Field label={label('Payment', 'طريقة الدفع')}>
            <Select
              value={c.method}
              onChange={(event) => {
                change(c.setMethod, event.target.value);
                c.setReceiptFile(null);
                setUploadError('');
              }}
            >
              <option value="cash">{label('Cash', 'كاش')}</option>
              {c.staff ? (
                <option value="card">
                  {label('Visa / Fawry', 'فيزا / فوري')}
                </option>
              ) : (
                <option value="instapay" disabled={!c.transferDetails}>
                  {label('InstaPay', 'إنستاباي')}
                  {!c.transferDetails
                    ? label(' — unavailable', ' — غير متاح')
                    : ''}
                </option>
              )}
            </Select>
          </Field>
          {c.method === 'instapay' && (
            <div className="my-4 rounded-2xl border border-bareeq-burgundy/20 bg-white/60 p-4">
              <p>
                {label(
                  'InstaPay receiving number / address',
                  'رقم أو عنوان التحويل عبر إنستاباي',
                )}
              </p>
              <strong className="block whitespace-pre-wrap text-xl" dir="ltr">
                {c.transferDetails}
              </strong>
              <p>
                {c.quote
                  ? label(
                      `Transfer exactly ${money(c.quote.total_minor)} and upload your receipt.`,
                      `حوّل ${money(c.quote.total_minor)} وارفع صورة الإيصال.`,
                    )
                  : label(
                      `Estimated total: ${money(c.estimatedTotal)}. Review the current total below before transferring.`,
                      `الإجمالي المبدئي: ${money(c.estimatedTotal)}. راجع الحساب قبل التحويل.`,
                    )}
              </p>
              <p className="text-sm font-semibold">
                {label('Transfer receipt (required)', 'إيصال التحويل (مطلوب)')}
              </p>
              <ImageUpload
                file={c.receiptFile}
                disabled={c.busy}
                onChange={(file) => {
                  c.setReceiptFile(file);
                  setUploadError('');
                }}
                onInvalid={setUploadError}
                title={label(
                  'Upload your InstaPay receipt',
                  'ارفع صورة إيصال إنستاباي',
                )}
              />
              {uploadError && (
                <p className="text-sm text-red-700" role="alert">
                  {uploadError}
                </p>
              )}
              {c.receiptFile && (
                <p role="status">
                  {label('Receipt selected: ', 'تم اختيار الإيصال: ')}
                  {c.receiptFile.name}
                </p>
              )}
            </div>
          )}
          <Field
            label={label('Notes', 'ملاحظات')}
            hint={label('Optional', 'اختياري')}
            error={error('notes')}
          >
            <TextArea
              {...accessibility('notes')}
              maxLength={500}
              value={c.notes}
              onChange={(event) => change(c.setNotes, event.target.value)}
            />
          </Field>
          <UIButton className="button" disabled={c.busy || !c.canOrder}>
            {label('Review current total', 'مراجعة الحساب')}
          </UIButton>
        </fieldset>
      </form>
    </section>
  );
}

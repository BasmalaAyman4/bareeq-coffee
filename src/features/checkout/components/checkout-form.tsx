import { UIButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TextArea } from '@/components/ui/textarea';
import { api } from '@/services/api';
import { ImageUpload } from '@/components/ui/image-upload';
import { customerError } from '../validation';
import { money } from '@/lib/money';

import type { Controller } from '@/features/checkout/hooks/use-checkout';
export function CheckoutForm({
  staff,
  menu,
  name,
  setName,
  phone,
  setPhone,
  notes,
  setNotes,
  setBranch,
  method,
  setMethod,
  fulfillment,
  setFulfillment,
  setQuote,
  busy,
  selectedBranch,
  canOrder,
  payload,
  run,
  receiptFile,
  setReceiptFile,
  transferDetails,
  setError,
  quote,
  subtotal,
}: Pick<
  Controller,
  | 'staff'
  | 'menu'
  | 'name'
  | 'setName'
  | 'phone'
  | 'setPhone'
  | 'notes'
  | 'setNotes'
  | 'setBranch'
  | 'method'
  | 'setMethod'
  | 'fulfillment'
  | 'setFulfillment'
  | 'setQuote'
  | 'busy'
  | 'selectedBranch'
  | 'canOrder'
  | 'payload'
  | 'run'
  | 'receiptFile'
  | 'setReceiptFile'
  | 'transferDetails'
  | 'setError'
  | 'quote'
  | 'subtotal'
>) {
  return (
    <section className="checkout-panel">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const invalid = customerError(name, phone, staff);
            if (invalid) throw new Error(invalid);
            setQuote(await api('quote', { order: payload() }));
          });
        }}
      >
        <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
          <h2>Your details</h2>
          <Field label="Name">
            <TextInput
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setQuote(null);
              }}
            />
          </Field>
          <Field label="Phone">
            <TextInput
              required={!staff}
              type="tel"
              inputMode="tel"
              placeholder="01012345678"
              maxLength={30}
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setQuote(null);
              }}
            />
          </Field>
          {staff && (
            <>
              <Field label="Branch">
                <Select
                  value={selectedBranch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setQuote(null);
                    setReceiptFile(null);
                  }}
                >
                  {menu.data?.branches.map((b) => (
                    <option value={b.id} key={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Fulfillment">
                <Select
                  value={fulfillment}
                  onChange={(e) => {
                    setFulfillment(e.target.value);
                    setQuote(null);
                  }}
                >
                  <option value="takeaway">Takeaway / collection</option>
                  <option value="dine_in">Dine-in</option>
                </Select>
              </Field>
            </>
          )}
          <Field label="Payment">
            <Select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setQuote(null);
                setReceiptFile(null);
              }}
            >
              <option value="cash">Cash</option>
              {staff ? (
                <option value="card">Visa / Fawry</option>
              ) : (
                <option value="instapay" disabled={!transferDetails}>
                  InstaPay{!transferDetails ? ' — unavailable' : ''}
                </option>
              )}
            </Select>
          </Field>
          {method === 'instapay' && (
            <div className="my-4 rounded-2xl border border-bareeq-burgundy/20 bg-white/60 p-4">
              <p>InstaPay receiving number / address</p>
              <strong className="block whitespace-pre-wrap text-xl" dir="ltr">
                {transferDetails}
              </strong>
              <p>
                {quote
                  ? `Transfer exactly ${money(quote.total_minor)} and upload your receipt.`
                  : `Estimated total: ${money(subtotal)}. Review the current total below before transferring.`}
              </p>
              <Field label="Transfer receipt" hint="Required for InstaPay">
                <ImageUpload
                  file={receiptFile}
                  disabled={busy}
                  onChange={setReceiptFile}
                  onInvalid={setError}
                  title="Upload your InstaPay receipt"
                />
              </Field>
              {receiptFile && (
                <p role="status">Receipt selected: {receiptFile.name}</p>
              )}
            </div>
          )}
          <Field
            label="Notes"
            hint="Optional: a preference or collection note."
          >
            <TextArea
              maxLength={500}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setQuote(null);
              }}
            />
          </Field>
          <UIButton className="button" disabled={busy || !canOrder}>
            Review current total
          </UIButton>
        </fieldset>
      </form>
    </section>
  );
}

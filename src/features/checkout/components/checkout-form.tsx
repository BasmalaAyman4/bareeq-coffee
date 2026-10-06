import { UIButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TextArea } from '@/components/ui/textarea';
import { api } from '@/services/api';

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
>) {
  return (
    <section className="checkout-panel">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => setQuote(await api('quote', { order: payload() })));
        }}
        onChange={() => setQuote(null)}
      >
        <h2>Your details</h2>
        <Field label="Name">
          <TextInput
            required
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <TextInput
            required={!staff}
            type="tel"
            maxLength={30}
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        {staff && (
          <>
            <Field label="Branch">
              <Select
                value={selectedBranch}
                onChange={(e) => setBranch(e.target.value)}
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
                onChange={(e) => setFulfillment(e.target.value)}
              >
                <option value="takeaway">Takeaway / collection</option>
                <option value="dine_in">Dine-in</option>
              </Select>
            </Field>
          </>
        )}
        <Field label="Payment">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="instapay">InstaPay</option>
          </Select>
        </Field>
        <Field label="Notes" hint="Optional: a preference or collection note.">
          <TextArea
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <UIButton className="button" disabled={busy || !canOrder}>
          Review current total
        </UIButton>
      </form>
    </section>
  );
}

import { UIButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { useMenu } from '@/features/catalog/hooks/use-menu';
import { api } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function Settings() {
  const menu = useMenu(),
    client = useQueryClient();
  const [message, setMessage] = useState('');
  return (
    <>
      {menu.data?.branches.map((b) => (
        <form
          className="menu-editor"
          key={b.id}
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            try {
              await api('menu_save', {
                entity: 'branches',
                record: {
                  id: b.id,
                  instapay_details: data.get('details'),
                  receipt_retention_days: Number(data.get('days')),
                },
              });
              await client.invalidateQueries({ queryKey: ['menu'] });
              setMessage('Settings saved.');
            } catch (e) {
              setMessage(String(e));
            }
          }}
        >
          <h2>{b.name}</h2>
          <Field label="InstaPay transfer details">
            <TextArea
              name="details"
              maxLength={500}
              defaultValue={b.instapay_details ?? ''}
            />
          </Field>
          <p>Leave blank to keep InstaPay checkout disabled.</p>
          <Field label="Receipt retention (days)">
            <TextInput
              name="days"
              type="number"
              min="3"
              max="30"
              defaultValue={b.receipt_retention_days}
            />
          </Field>
          <UIButton className="button">Save settings</UIButton>
        </form>
      ))}
      <p role="status">{message}</p>
    </>
  );
}

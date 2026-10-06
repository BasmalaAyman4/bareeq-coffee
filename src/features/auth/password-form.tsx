import { UIButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import { useState } from 'react';

export function PasswordForm({
  founder = false,
  forced = false,
}: {
  founder?: boolean;
  forced?: boolean;
}) {
  const [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState(''),
    [target, setTarget] = useState('self'),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="menu-editor"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        if (password !== confirm) {
          setMessage('Passwords do not match.');
          return;
        }
        setBusy(true);
        try {
          await api('password', { password, target });
          setPassword('');
          setConfirm('');
          if (target === 'self')
            await supabase.auth.signOut({ scope: 'local' });
          setMessage(
            target === 'self'
              ? 'Password changed. Sign in with your new password.'
              : 'Cashier password reset. Their sessions were signed out; they must change it at next sign-in.',
          );
        } catch (e) {
          setMessage(String(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>{forced ? 'Set your new password' : 'Password settings'}</h2>
      {founder && (
        <Field label="Account">
          <Select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="self">My Founder account (10)</option>
            <option value="cashier">Reset Cashier account (00)</option>
          </Select>
        </Field>
      )}
      <Field label="New password">
        <TextInput
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Field label="Confirm password">
        <TextInput
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </Field>
      <UIButton disabled={busy} loading={busy} className="button">
        Save password
      </UIButton>
      <p role="status">{message}</p>
    </form>
  );
}

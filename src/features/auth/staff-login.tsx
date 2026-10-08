import { useCopy } from '@/i18n/i18n-provider';
import { UIButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import Link from '@/router';
import { api } from '@/services/api';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/i18n/i18n-provider';

import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard';
export function StaffLogin({
  founder,
  session,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  busy,
  identity,
  run,
}: Pick<
  DashboardController,
  | 'founder'
  | 'session'
  | 'email'
  | 'setEmail'
  | 'password'
  | 'setPassword'
  | 'showPassword'
  | 'setShowPassword'
  | 'error'
  | 'busy'
  | 'identity'
  | 'run'
>) {
  const tr = useCopy();

  const { t } = useI18n();
  return (
    <main className="staff-login !grid !min-h-screen !max-w-none !place-items-center !bg-bareeq-cream/55 !p-5 sm:!p-8">
      <section className="w-full max-w-md overflow-hidden rounded-[2rem] border border-bareeq-espresso/10 bg-bareeq-ivory p-6 shadow-bareeq sm:p-9">
        <Link
          className="mb-8 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold text-bareeq-espresso/65 transition hover:bg-bareeq-blush/45 hover:text-bareeq-burgundy"
          href="/"
        >
          <ArrowLeft size={16} /> {t('back')}
        </Link>
        <div className="mb-8 text-center">
          <img
            className="!m-0 !mb-4 !inline-block !size-20 object-contain drop-shadow-md"
            src="/assets/bareeq-logo.png"
            alt={tr('Bareeq')}
          />
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-bareeq-gold">
            {tr('Bareeq')}{' '}
            {founder === null
              ? 'Staff'
              : founder
                ? tr('Founder')
                : tr('Cashier')}
          </p>
          <h1 className="!mb-2 !text-3xl !leading-tight !text-bareeq-espresso sm:!text-4xl">
            {t('welcomeBack')}
          </h1>
          <p className="m-0 text-sm leading-6 text-bareeq-espresso/60">
            {tr('Sign in to open your')}{' '}
            {founder === null
              ? 'café'
              : founder
                ? 'café management'
                : 'counter'}{' '}
            {tr('workspace.')}
          </p>
        </div>
        {session ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
            role="alert"
          >
            <strong className="block font-bold">
              {t('accessUnavailable')}
            </strong>
            {identity.isPending ? t('checkingAccount') : t('askFounder')}
            <UIButton
              tone="secondary"
              className="mt-4 w-full"
              onClick={() => supabase.auth.signOut()}
            >
              {t('signOut')}
            </UIButton>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const tokens = await api('login', {
                  code: email,
                  password,
                });
                const r = await supabase.auth.setSession(tokens);
                if (r.error) throw r.error;
                setPassword('');
              });
            }}
          >
            <Field label={t('staffCode')}>
              <TextInput
                className="!h-12 !rounded-2xl !text-base"
                type="text"
                inputMode="numeric"
                pattern="10|00"
                maxLength={2}
                required
                autoComplete="username"
                placeholder={t('staffCode')}
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\D/g, ''))}
              />
            </Field>
            <Field label={t('password')}>
              <div className="relative">
                <TextInput
                  className="!h-12 !rounded-2xl !pr-12 !text-base"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-2 top-1/4 grid size-8 -translate-y-1/2 place-items-center rounded-lg border-0 bg-transparent text-bareeq-espresso/45 transition hover:bg-bareeq-blush/50 hover:text-bareeq-burgundy focus:outline-none focus:ring-2 focus:ring-bareeq-burgundy/20"
                  type="button"
                  aria-label={
                    showPassword ? tr('Hide password') : tr('Show password')
                  }
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            {error && (
              <p
                className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800"
                role="alert"
              >
                {error.replaceAll('_', ' ')}
              </p>
            )}
            <UIButton
              className="!mt-2 !h-12 !w-full !rounded-2xl !text-base"
              loading={busy}
            >
              {t('signIn')}
            </UIButton>
          </form>
        )}
        <p className="mb-0 mt-7 text-center text-xs leading-5 text-bareeq-espresso/45">
          {t('secureAccess')}
        </p>
      </section>
    </main>
  );
}

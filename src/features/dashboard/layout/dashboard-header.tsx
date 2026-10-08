import { useCopy } from '@/i18n/i18n-provider';
import type { DashboardController } from '../hooks/use-dashboard';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useI18n } from '@/i18n/i18n-provider';
import { supabase } from '@/lib/supabase';
import Link from '@/router';
export function DashboardHeader({
  pushReady,
  enabling,
  enableAlerts,
  run,
  client,
  connection,
}: DashboardController) {
  const tr = useCopy();

  const { t, isArabic } = useI18n();
  return (
    <>
      <header className="dashboard-topbar">
        <Link href="/" aria-label={tr('Bareeq')}>
          <img src="/assets/bareeq-logo.png" alt={tr('Bareeq')} />
        </Link>
        <div className="dashboard-topbar-actions">
          <LanguageToggle />
          <button
            onClick={() =>
              run(async () => {
                await supabase.auth.signOut();
                client.clear();
              })
            }
          >
            {t('signOut')}
          </button>
        </div>
      </header>
      {!pushReady && (
        <div className="dashboard-permission" role="status">
          <span>
            {isArabic
              ? 'اسمحي بالإشعارات لاستقبال الطلبات والموبايل مقفول.'
              : 'Allow notifications to receive orders while the app is closed.'}
          </span>
          <button disabled={enabling} onClick={enableAlerts}>
            {enabling
              ? t('loading')
              : isArabic
                ? 'تفعيل الإشعارات'
                : 'Enable notifications'}
          </button>
        </div>
      )}
      {connection !== 'Live updates connected' && (
        <p role="status" className="small-note">
          {isArabic
            ? 'جاري إعادة الاتصال بالطلبات…'
            : 'Reconnecting to orders…'}
        </p>
      )}
    </>
  );
}

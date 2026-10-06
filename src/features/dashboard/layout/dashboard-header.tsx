import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useI18n } from '@/i18n/i18n-provider';
export function DashboardHeader({ view }: Pick<DashboardController, 'view'>) {
  const { t } = useI18n();
  return (
    <header className="staff-header !mb-7 !rounded-3xl !border !border-bareeq-espresso/10 !bg-bareeq-ivory !p-6 !shadow-sm">
      <div>
        <p className="eyebrow">A shine in every shift</p>
        <h1>
          {view === 'orders'
            ? t('today')
            : view === 'reports'
              ? t('dailyPicture')
              : view === 'menu'
                ? t('madeMenu')
                : view === 'settings'
                  ? t('configured')
                  : t('counter')}
        </h1>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-emerald-700/12 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        {t('liveAlerts')}
      </div>
      <LanguageToggle />
    </header>
  );
}

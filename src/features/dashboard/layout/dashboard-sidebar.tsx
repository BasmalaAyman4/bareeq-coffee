import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard';
import Link from '@/router';
import {
  BarChart3,
  ClipboardList,
  KeyRound,
  PackagePlus,
  Settings2,
} from 'lucide-react';
import { DashboardFooter } from './dashboard-footer';
import { useI18n } from '@/i18n/i18n-provider';
export function DashboardSidebar({
  founder,
  client,
  view,
  setView,
  connection,
  run,
}: Pick<
  DashboardController,
  'founder' | 'client' | 'view' | 'setView' | 'connection' | 'run'
>) {
  const { t } = useI18n();
  return (
    <aside className="staff-sidebar !sticky !top-0 !flex !h-screen !flex-col !border-r !border-bareeq-ivory/15 !bg-bareeq-wine !px-4 !py-5 !shadow-xl max-lg:!relative max-lg:!h-auto max-lg:!flex-row max-lg:!items-center max-lg:!gap-2 max-lg:!overflow-x-auto max-lg:!border-b max-lg:!border-r-0 max-lg:!p-3">
      <Link
        className="!mb-7 !flex !items-center !gap-3 !rounded-2xl !px-3 !py-2 hover:!bg-white/10 max-lg:!mb-0"
        href="/"
      >
        <img
          className="!m-0 !size-11 !object-contain"
          src="/assets/bareeq-logo.png"
          alt="Bareeq"
        />
        <span className="font-serif text-2xl tracking-tight text-bareeq-ivory">
          Bareeq
        </span>
      </Link>
      <div className="mb-5 px-3 max-lg:!hidden">
        <p className="!mb-1 text-[10px] font-bold uppercase tracking-[0.2em] !text-bareeq-gold">
          {t('operations')}
        </p>
        <p className="!m-0 text-sm font-medium !text-bareeq-ivory/75">
          {founder ? t('founderWorkspace') : t('cashierWorkspace')}
        </p>
      </div>
      <nav
        className="flex flex-1 flex-col max-lg:!flex-row"
        aria-label="Dashboard navigation"
      >
        <ul className="m-0 flex list-none flex-col gap-1 p-0 max-lg:flex-row">
          {[
            { id: 'orders', label: t('orders'), icon: ClipboardList },
            ...(founder
              ? [
                  {
                    id: 'reports',
                    label: t('dailyReport'),
                    icon: BarChart3,
                  },
                  { id: 'menu', label: t('menuControl'), icon: Settings2 },
                  {
                    id: 'settings',
                    label: t('cafeSettings'),
                    icon: Settings2,
                  },
                  {
                    id: 'password',
                    label: t('passwordAccess'),
                    icon: KeyRound,
                  },
                ]
              : []),
            {
              id: 'counter',
              label: t('newCounterOrder'),
              icon: PackagePlus,
            },
          ].map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <li key={id} className="list-none">
                <button
                  aria-current={active ? 'page' : undefined}
                  className={`group relative !flex !w-full !items-center !gap-3 !overflow-hidden !rounded-xl !px-3 border-none !py-3 !text-left !text-sm !font-bold !transition-all !duration-200 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-bareeq-gold/80 ${
                    active
                      ? '!bg-bareeq-ivory !text-bareeq-wine !shadow-[0_10px_24px_rgba(20,8,10,0.22)]'
                      : '!bg-transparent !text-white hover:!translate-x-0.5 hover:!bg-bareeq-ivory hover:!text-bareeq-wine'
                  }`}
                  onClick={() => setView(id)}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg transition ${active ? 'bg-bareeq-burgundy/10 text-bareeq-burgundy' : 'bg-white/8 text-bareeq-ivory/75 group-hover:bg-bareeq-burgundy/10 group-hover:text-bareeq-ivory'}`}
                  >
                    <Icon size={17} strokeWidth={2.2} />
                  </span>
                  <span className="whitespace-nowrap">{label}</span>
                  {active && (
                    <span className="ml-auto size-1.5 rounded-full bg-bareeq-gold" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <DashboardFooter connection={connection} run={run} client={client} />
    </aside>
  );
}

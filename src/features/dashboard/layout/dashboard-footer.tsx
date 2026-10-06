import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard';
import { useI18n } from '@/i18n/i18n-provider';
export function DashboardFooter({
  client,
  connection,
  run,
}: Pick<DashboardController, 'client' | 'connection' | 'run'>) {
  const { t } = useI18n();
  return (
    <div className="mt-6 border-t border-white/15 px-3 pt-4 max-lg:!m-0 max-lg:!border-0 max-lg:!p-0">
      <p className="!mb-3 flex items-center gap-2 text-xs !text-bareeq-ivory/65">
        <span className="size-2 rounded-full bg-emerald-400" />
        {connection}
      </p>
      <button
        className="!flex !w-full !items-center !gap-3  border border-bareeq-burgundy/25 !rounded-xl !px-3 !py-2.5 !bg-transparent !text-sm !font-bold !text-bareeq-ivory/75 hover:!bg-white/10 hover:!text-bareeq-ivory"
        onClick={() =>
          run(async () => {
            await supabase.auth.signOut();
            client.clear();
          })
        }
      >
        <LogOut size={17} /> {t('signOut')}
      </button>
    </div>
  );
}

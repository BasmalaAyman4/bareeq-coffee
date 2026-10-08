import { PasswordForm } from '@/features/auth/password-form';
import { MenuEditor } from '@/features/catalog/menu-editor';
import { CounterOrder } from '@/features/counter/counter-order';
import { OrdersTable } from '@/features/orders/components/orders-table';
import { DailyReport } from '@/features/reports/daily-report';
import { Settings } from '@/features/settings/cafe-settings';
import type { DashboardController } from './hooks/use-dashboard';

export function DashboardContent({
  controller,
}: {
  controller: DashboardController;
}) {
  const { view, founder } = controller;
  if (!founder)
    return (
      <>
        <div hidden={view !== 'counter'}>
          <CounterOrder />
        </div>
        {view === 'orders' && <OrdersTable {...controller} />}
      </>
    );
  if (view === 'orders') return <OrdersTable {...controller} />;
  switch (view) {
    case 'password':
      return <PasswordForm founder />;
    case 'reports':
      return <DailyReport />;
    case 'menu':
      return <MenuEditor />;
    case 'settings':
      return (
        <div className="dashboard-settings">
          <Settings />
          <PasswordForm founder />
        </div>
      );
    default:
      return null;
  }
}

import { UIButton } from '@/components/ui/button';
import { PasswordForm } from '@/features/auth/password-form';
import { StaffLogin } from '@/features/auth/staff-login';
import { StaffLoading } from '@/features/auth/staff-loading';
import { OrderDetailsModal } from '@/features/orders/components/order-details-modal';
import { supabase } from '@/lib/supabase';
import { DashboardContent } from './dashboard-content';
import { useDashboard } from './hooks/use-dashboard';
import { DashboardHeader } from './layout/dashboard-header';
import { DashboardLayout } from './layout/dashboard-layout';
import { DashboardSidebar } from './layout/dashboard-sidebar';
export function Dashboard({ roleHint = null }: { roleHint?: boolean | null }) {
  const controller = useDashboard(roleHint);
  const {
    founder,
    session,
    error,
    alert,
    setAlert,
    identity,
    allowed,
    loading,
  } = controller;
  if (loading) return <StaffLoading founder={founder} />;
  if (session && identity.data?.changeRequired && !founder)
    return (
      <main className="staff-login">
        <h1>Cashier access is managed by Founder.</h1>
        <p>
          Ask the Founder to set or reset the Cashier password. This workspace
          does not provide password-management access.
        </p>
        <UIButton onClick={() => supabase.auth.signOut()}>Sign out</UIButton>
      </main>
    );
  if (session && identity.data?.changeRequired)
    return (
      <main className="staff-login">
        <h1>Choose your password.</h1>
        <p>Replace your temporary password before opening the dashboard.</p>
        <PasswordForm founder forced />
      </main>
    );
  if (!session || !allowed) return <StaffLogin {...controller} />;
  return (
    <DashboardLayout
      sidebar={<DashboardSidebar {...controller} />}
      header={<DashboardHeader {...controller} />}
      modal={<OrderDetailsModal {...controller} />}
    >
      {error && (
        <p role="alert" className="backend-notice">
          {error.replaceAll('_', ' ')}
        </p>
      )}
      {alert && (
        <div className="staff-alert mb-3" role="status">
          {alert}
          <UIButton onClick={() => setAlert('')}>Dismiss</UIButton>
        </div>
      )}
      <DashboardContent controller={controller} />
    </DashboardLayout>
  );
}

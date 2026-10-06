import type { ReactNode } from 'react';

type DashboardLayoutProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  modal?: ReactNode;
};

export function DashboardLayout({
  sidebar,
  header,
  children,
  modal,
}: DashboardLayoutProps) {
  return (
    <main className="staff-layout !grid !grid-cols-[17rem_minmax(0,1fr)] !bg-bareeq-cream/55 max-lg:!grid-cols-1">
      {sidebar}
      <section className="staff-main !max-w-none !px-6 !py-8 lg:!px-10">
        {header}
        {children}
      </section>
      {modal}
    </main>
  );
}

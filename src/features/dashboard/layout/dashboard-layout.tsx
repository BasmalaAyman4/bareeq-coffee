import type { ReactNode } from 'react';

type DashboardLayoutProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  modal?: ReactNode;
  founder?: boolean;
};

export function DashboardLayout({
  sidebar,
  header,
  children,
  modal,
  founder,
}: DashboardLayoutProps) {
  return (
    <main
      className={`dashboard-shell ${founder ? 'dashboard-founder' : 'dashboard-cashier'}`}
    >
      {sidebar}
      <section className="dashboard-main">
        {header}
        {children}
      </section>
      {modal}
    </main>
  );
}

import type { DashboardController } from '../hooks/use-dashboard';
import {
  BarChart3,
  ClipboardList,
  PackagePlus,
  Settings2,
  Utensils,
} from 'lucide-react';
import { useI18n } from '@/i18n/i18n-provider';
export function DashboardSidebar({
  founder,
  view,
  setView,
  unreadCount,
}: DashboardController) {
  const { t, isArabic } = useI18n();
  const links = founder
    ? [
        { id: 'orders', label: t('orders'), icon: ClipboardList },
        {
          id: 'reports',
          label: isArabic ? 'التقرير' : 'Report',
          icon: BarChart3,
        },
        { id: 'menu', label: t('menu'), icon: Utensils },
        {
          id: 'settings',
          label: isArabic ? 'الإعدادات' : 'Settings',
          icon: Settings2,
        },
      ]
    : [
        { id: 'counter', label: t('newCounterOrder'), icon: PackagePlus },
        { id: 'orders', label: t('orders'), icon: ClipboardList },
      ];
  return (
    <nav
      className={founder ? 'dashboard-bottom-nav' : 'dashboard-cashier-nav'}
      aria-label={isArabic ? 'التنقل في لوحة التحكم' : 'Dashboard navigation'}
    >
      {links.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          aria-current={view === id ? 'page' : undefined}
          onClick={() => setView(id)}
        >
          <span className="dashboard-nav-icon">
            <Icon size={23} />
            {id === 'orders' && unreadCount > 0 && (
              <span
                className="order-unread-badge"
                aria-label={
                  isArabic
                    ? `${unreadCount} طلبات جديدة`
                    : `${unreadCount} new orders`
                }
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

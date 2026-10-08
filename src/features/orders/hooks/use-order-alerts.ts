import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { cashierActionableOrder } from '../order-display';
import type { useOrders } from './use-orders';
import { useNotifications } from './use-notifications';
import { useI18n } from '@/i18n/i18n-provider';

export function useOrderAlerts({
  founder,
  allowed,
  orders,
  selected,
  setSelected,
  userId,
  view,
}: {
  founder: boolean;
  allowed: boolean;
  orders: ReturnType<typeof useOrders>['orders'];
  selected: any;
  setSelected: Dispatch<SetStateAction<any>>;
  userId?: string;
  view: string;
}) {
  const [alert, setAlert] = useState('');
  const { isArabic } = useI18n();
  const seen = useRef(new Set<string>());
  const initialized = useRef(false);
  const [unread, setUnread] = useState<string[]>([]);
  const notifications = useNotifications(allowed, userId);
  useEffect(() => {
    seen.current.clear();
    initialized.current = false;
    setAlert('');
    setUnread([]);
  }, [userId, founder]);
  useEffect(() => {
    if (!allowed || !orders.data) return;
    const actionable = orders.data.filter((o) =>
      founder
        ? o.status === 'awaiting_payment_verification'
        : cashierActionableOrder(o),
    );
    const fresh = actionable.filter((o) => !seen.current.has(o.id));
    for (const o of actionable) seen.current.add(o.id);
    if (fresh.length) {
      if (view !== 'orders')
        setUnread((previous) => [
          ...new Set([...previous, ...fresh.map((o) => o.id)]),
        ]);
      setAlert(
        isArabic
          ? `${fresh.length} ${founder ? 'طلبات مراجعة تحويل جديدة' : 'طلبات موقع جديدة'}`
          : `${fresh.length} ${founder ? 'payment verification request(s)' : 'new online order(s)'}`,
      );
      if (initialized.current) notifications.ring();
    }
    initialized.current = true;
    const deep = new URLSearchParams(location.search).get('order');
    if (deep && !selected) setSelected(orders.data.find((o) => o.id === deep));
  }, [
    orders.data,
    founder,
    allowed,
    notifications.ring,
    selected,
    setSelected,
    view,
  ]);
  useEffect(() => {
    if (view === 'orders') {
      setUnread([]);
      setAlert('');
    }
  }, [view]);
  return { alert, setAlert, unreadCount: unread.length, ...notifications };
}

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

export function useOrderAlerts({
  founder,
  allowed,
  orders,
  selected,
  setSelected,
  userId,
}: {
  founder: boolean;
  allowed: boolean;
  orders: ReturnType<typeof useOrders>['orders'];
  selected: any;
  setSelected: Dispatch<SetStateAction<any>>;
  userId?: string;
}) {
  const [alert, setAlert] = useState('');
  const seen = useRef(new Set<string>());
  const initialized = useRef(false);
  const notifications = useNotifications(allowed, userId);
  useEffect(() => {
    seen.current.clear();
    initialized.current = false;
    setAlert('');
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
      setAlert(
        `${fresh.length} ${founder ? 'payment verification request(s)' : 'new online order(s)'}`,
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
  ]);
  return { alert, setAlert, ...notifications };
}

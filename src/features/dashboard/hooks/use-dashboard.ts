import { useStaffSession } from '@/features/auth/hooks/use-staff-session';
import { useOrderAlerts } from '@/features/orders/hooks/use-order-alerts';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { cashierCanSeeOrder } from '@/features/orders/order-display';
import { money } from '@/lib/money';
import { api } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
export function useDashboard(roleHint: boolean | null = null) {
  const client = useQueryClient();
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [showPassword, setShowPassword] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [view, setView] = useState('orders'),
    [search, setSearch] = useState(''),
    [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null),
    [receipt, setReceipt] = useState('');
  const actionLock = useRef(false);
  const { session, identity, allowed, loading } = useStaffSession(
    roleHint,
    setSelected,
    setReceipt,
  );
  const founder = roleHint ?? identity.data?.role === 'founder';
  const { orders, connection } = useOrders(!!allowed, identity.data?.user);
  const {
    alert,
    setAlert,
    sound,
    pushReady,
    enabling,
    notificationMessage,
    enableAlerts,
  } = useOrderAlerts({
    founder,
    allowed: !!allowed,
    orders,
    selected,
    setSelected,
    userId: identity.data?.user,
  });
  useEffect(() => {
    setFilter(founder ? 'pending' : 'all');
  }, [founder]);
  useEffect(() => {
    if (selected && orders.data)
      setSelected(orders.data.find((o) => o.id === selected.id) ?? null);
  }, [orders.data]);
  async function run(fn: () => Promise<void>) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setBusy(false);
      actionLock.current = false;
    }
  }
  async function transition(order: any, next: string) {
    const reason = ['cancelled', 'payment_rejected'].includes(next)
      ? window.prompt('Reason (required)')
      : '';
    if (
      reason === null ||
      (['cancelled', 'payment_rejected'].includes(next) && !reason?.trim())
    )
      return;
    if (
      next === 'new' &&
      !window.confirm(
        'Have you verified the actual incoming transfer for exactly ' +
          money(order.total_minor) +
          '? The screenshot alone is not proof.',
      )
    )
      return;
    if (
      next === 'completed' &&
      ['cash', 'card'].includes(order.payment_method) &&
      !window.confirm(
        `Confirm ${order.payment_method === 'cash' ? 'cash' : 'Visa / Fawry machine payment'} has been collected: ` +
          money(order.total_minor),
      )
    )
      return;
    await run(async () => {
      await api('transition', { id: order.id, next, reason: reason ?? '' });
      await client.invalidateQueries({ queryKey: ['orders'] });
    });
  }
  // RLS already prevents an unverified InstaPay order from being downloaded by
  // a Cashier. This second check protects the rendered queue as well, even if
  // a stale cache or a future query changes accidentally.
  const permittedOrders = founder
    ? (orders.data ?? [])
    : (orders.data ?? []).filter(cashierCanSeeOrder);
  const visible = permittedOrders.filter(
    (o) =>
      (filter === 'all' || filter === 'pending'
        ? filter === 'all' || o.status === 'awaiting_payment_verification'
        : ![
            'completed',
            'cancelled',
            'payment_rejected',
            'awaiting_receipt',
          ].includes(o.status)) &&
      `${o.number} ${o.customer_name} ${o.phone}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return {
    founder,
    client,
    session,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    setError,
    busy,
    setBusy,
    view,
    setView,
    search,
    setSearch,
    filter,
    setFilter,
    selected,
    setSelected,
    receipt,
    setReceipt,
    connection,
    alert,
    setAlert,
    actionLock,
    loading,
    identity,
    allowed,
    orders,
    run,
    transition,
    permittedOrders,
    visible,
    sound,
    pushReady,
    enabling,
    notificationMessage,
    enableAlerts,
  };
}
export type DashboardController = ReturnType<typeof useDashboard>;

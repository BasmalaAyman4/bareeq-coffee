export const nextStatus: Record<string, string> = {
  new: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};
export const statusTone = (status: string, order?: any) => {
  if (order?.source === 'cashier') return 'success';
  if (['completed', 'ready'].includes(status)) return 'success';
  if (['cancelled', 'payment_rejected'].includes(status)) return 'danger';
  if (['awaiting_payment_verification', 'awaiting_receipt'].includes(status))
    return 'warning';
  if (['new', 'accepted', 'preparing'].includes(status)) return 'brand';
  return 'neutral';
};
export const statusLabel = (status: string, order?: any) =>
  order?.source === 'cashier' ? 'Paid at counter' : status.replaceAll('_', ' ');
export const paymentStatus = (order: any) =>
  Array.isArray(order.payments)
    ? order.payments[0]?.status
    : order.payments?.status;
export const cashierCanSeeOrder = (order: any) =>
  order.source === 'cashier' ||
  (order.source === 'web' &&
    (order.payment_method === 'cash' || paymentStatus(order) === 'verified'));
export const cashierActionableOrder = (order: any) =>
  order.source === 'web' &&
  order.status === 'new' &&
  (order.payment_method === 'cash' || paymentStatus(order) === 'verified');
export const orderTypeLabel = (order: any) =>
  order.source === 'web'
    ? order.fulfillment === 'delivery'
      ? 'Online · Delivery'
      : 'Online'
    : order.source === 'cashier'
      ? 'Counter sale'
      : order.fulfillment === 'dine_in'
        ? 'Dine-in'
        : 'Takeaway';

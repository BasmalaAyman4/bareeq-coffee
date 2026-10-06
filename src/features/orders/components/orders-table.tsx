import { UIButton } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/table';
import {
  orderTypeLabel,
  paymentStatus,
  statusLabel,
  statusTone,
} from '@/features/orders/order-display';
import { money } from '@/lib/money';
import { Eye, RefreshCw, Search } from 'lucide-react';

import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard';
import { useI18n } from '@/i18n/i18n-provider';
export function OrdersTable({
  founder,
  search,
  setSearch,
  filter,
  setFilter,
  setSelected,
  setReceipt,
  orders,
  visible,
}: Pick<
  DashboardController,
  | 'founder'
  | 'search'
  | 'setSearch'
  | 'filter'
  | 'setFilter'
  | 'setSelected'
  | 'setReceipt'
  | 'orders'
  | 'visible'
>) {
  const { t } = useI18n();
  return (
    <>
      <section className="mb-5 rounded-3xl border border-bareeq-espresso/10 bg-bareeq-ivory p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/4 z-10 -translate-y-1/2 text-bareeq-espresso/45"
              size={18}
            />
            <TextInput
              className="!h-12 !rounded-2xl !pl-10"
              placeholder={`${t('search')} ${t('orders').toLowerCase()}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            className="!h-12 !w-full !rounded-2xl xl:!w-60"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t('allOrders')}</option>
            <option value="active">{t('activeOrders')}</option>
            {founder && (
              <option value="pending">{t('paymentVerification')}</option>
            )}
          </Select>
          <UIButton
            tone="secondary"
            className="!h-12 !rounded-2xl !px-5"
            disabled={orders.isFetching}
            loading={orders.isFetching}
            onClick={() => orders.refetch()}
          >
            {!orders.isFetching && <RefreshCw size={17} />}
            {t('refresh')}
          </UIButton>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-bareeq-espresso/8 pt-4 text-sm">
          <p className="m-0 font-semibold text-bareeq-espresso">
            <span className="mr-2 inline-flex size-2 rounded-full bg-emerald-500" />
            {visible.length} {t('orders').toLowerCase()}
          </p>
          <p className="m-0 text-bareeq-espresso/60">
            {t('liveAlerts')} · {t('refresh')}
          </p>
        </div>
      </section>
      {orders.isError && (
        <p role="alert">
          Unable to refresh the queue. Previously loaded orders may be out of
          date.
        </p>
      )}
      <DataTable
        columns={[
          {
            key: 'order',
            header: t('orders'),
            cell: (o: any) => (
              <div className="min-w-28">
                <strong className="block text-bareeq-burgundy">
                  #{o.number}
                </strong>
                <span className="text-xs text-bareeq-espresso/55">
                  {new Date(o.created_at).toLocaleString('en-EG', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ),
          },
          {
            key: 'customer',
            header: t('name'),
            cell: (o: any) => (
              <div>
                <strong className="block">
                  {o.customer_name || t('counterSale')}
                </strong>
                <span className="text-xs text-bareeq-espresso/55">
                  {o.phone || t('phone')}
                </span>
              </div>
            ),
          },
          {
            key: 'channel',
            header: t('source'),
            cell: (o: any) => (
              <div>
                <strong className="block">{orderTypeLabel(o)}</strong>
                <span className="text-xs text-bareeq-espresso/55">
                  {o.payment_method === 'cash'
                    ? t('cash')
                    : o.payment_method === 'card'
                      ? t('visa')
                      : paymentStatus(o) === 'verified'
                        ? `${t('instapay')} ✓`
                        : `${t('instapay')} …`}
                </span>
              </div>
            ),
          },
          {
            key: 'items',
            header: t('items'),
            align: 'end',
            cell: (o: any) =>
              o.order_items.reduce((n: number, i: any) => n + i.quantity, 0),
          },
          {
            key: 'total',
            header: t('total'),
            align: 'end',
            cell: (o: any) => <strong>{money(o.total_minor)}</strong>,
          },
          {
            key: 'status',
            header: t('status'),
            cell: (o: any) => (
              <StatusBadge tone={statusTone(o.status, o)}>
                {statusLabel(o.status, o)}
              </StatusBadge>
            ),
          },
          {
            key: 'action',
            header: t('view'),
            align: 'end',
            cell: (o: any) => (
              <UIButton
                tone="secondary"
                className="!min-h-9 !rounded-lg !px-3 !py-1.5"
                onClick={() => {
                  setSelected(o);
                  setReceipt('');
                }}
              >
                <Eye size={15} /> {t('view')}
              </UIButton>
            ),
          },
        ]}
        rows={visible}
        empty={orders.isPending ? t('loading') : t('noOrders')}
      />
      {!visible.length && (
        <p className="mt-3 text-sm text-bareeq-espresso/60">
          Orders stay safely in the queue when this screen is closed or
          reconnecting.
        </p>
      )}
    </>
  );
}

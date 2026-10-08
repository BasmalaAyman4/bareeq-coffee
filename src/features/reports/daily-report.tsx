import { useI18n } from '@/i18n/i18n-provider';
import { catalogLabel } from '@/i18n/catalog-label';
import { useMenu } from '@/features/catalog/hooks/use-menu';
import { api } from '@/services/api';
import { money } from '@/lib/money';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
export function DailyReport() {
  const { isArabic, language } = useI18n();
  const label = (en: string, ar: string) => (isArabic ? ar : en);
  const menu = useMenu();
  const [day, setDay] = useState(() =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(
      new Date(),
    ),
  );
  const [branch, setBranch] = useState('');
  const branchId = branch || menu.data?.branches[0]?.id;
  const report = useQuery({
    queryKey: ['report', day, branchId],
    enabled: !!branchId,
    queryFn: () => api('report', { day, branch_id: branchId }),
    refetchInterval: 15000,
  });
  const r = report.data;
  return (
    <section>
      <h1>{label('Daily report', 'التقرير اليومي')}</h1>
      <div className="staff-toolbar">
        <label>
          {label('Day', 'اليوم')}
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
        <label>
          {label('Branch', 'الفرع')}
          <select value={branchId} onChange={(e) => setBranch(e.target.value)}>
            {menu.data?.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {catalogLabel(b, language)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {report.isPending && (
        <p role="status">{label('Loading report…', 'جاري تحميل التقرير…')}</p>
      )}
      {report.isError && (
        <p role="alert">
          {label(
            'Report unavailable. Try again.',
            'تعذر تحميل التقرير. حاول مرة أخرى.',
          )}{' '}
          <button onClick={() => report.refetch()}>
            {label('Retry', 'إعادة المحاولة')}
          </button>
        </p>
      )}
      {r && (
        <>
          <div className="report-summary">
            <article>
              <p>{label('Counter orders', 'طلبات الكاونتر')}</p>
              <strong>{r.counter_count ?? '—'}</strong>
              <small>
                {label(
                  'Orders created on this day, excluding cancelled orders.',
                  'الطلبات المسجلة في اليوم المختار، بدون الملغي.',
                )}
              </small>
            </article>
            <article>
              <p>{label('Website orders', 'طلبات الموقع')}</p>
              <strong>{r.web_count ?? '—'}</strong>
              <small>
                {label(
                  'Submitted orders, excluding cancelled, rejected and missing-receipt orders.',
                  'الطلبات المرسلة، بدون الملغي والمرفوض والمنتظر إيصالًا.',
                )}
              </small>
            </article>
            <article>
              <p>{label('Money collected', 'الفلوس المتحصّلة')}</p>
              <strong>
                {r.collected_minor === undefined
                  ? '—'
                  : money(r.collected_minor)}
              </strong>
              <small>
                {label(
                  'Payments confirmed on this day, including delivery. Not profit.',
                  'المدفوعات المؤكد تحصيلها في اليوم المختار، شاملة التوصيل. وليست صافي الربح.',
                )}
              </small>
            </article>
          </div>
          <div className="menu-editor">
            <h2>
              {label('Collected by payment method', 'تفصيل الفلوس المتحصّلة')}
            </h2>
            {(
              [
                ['collected_cash_minor', 'Cash', 'كاش'],
                ['collected_card_minor', 'Card / Fawry', 'فيزا / فوري'],
                ['collected_instapay_minor', 'InstaPay', 'إنستاباي'],
              ] as const
            ).map(([key, en, ar]) => (
              <div className="staff-line" key={key}>
                <span>{label(en, ar)}</span>
                <strong>{r[key] === undefined ? '—' : money(r[key])}</strong>
              </div>
            ))}
            <p className="small-note">
              {label(
                'Dates follow Cairo time. Order counts use the order date; collections use the payment date.',
                'التوقيت حسب القاهرة. عدد الطلبات حسب تاريخ إنشائها، والتحصيل حسب تاريخ تأكيد الدفع.',
              )}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

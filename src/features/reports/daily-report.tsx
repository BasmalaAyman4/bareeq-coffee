import { UIButton } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DataTable } from '@/components/ui/table';
import { useMenu } from '@/features/catalog/hooks/use-menu';
import { money } from '@/lib/money';
import { api } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function DailyReport() {
  const menu = useMenu();
  const [day, setDay] = useState(() =>
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(
        new Date(),
      ),
    ),
    [branch, setBranch] = useState('');
  const branchId = branch || menu.data?.branches[0]?.id;
  const report = useQuery({
    queryKey: ['report', day, branchId],
    enabled: !!branchId,
    queryFn: () => api('report', { day, branch_id: branchId }),
  });
  function download() {
    const r = report.data;
    const rows = [
      ['Metric', 'Value'],
      ...Object.entries(r)
        .filter(([k]) => k !== 'top_products')
        .map(([k, v]) => [k, String(v)]),
      ['Product', 'Quantity', 'Revenue (EGP)'],
      ...r.top_products.map((p: any) => [
        p.product_name,
        String(p.quantity),
        String(p.revenue_minor / 100),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map(
            (v: string) =>
              '"' +
              (/^[=+@-]/.test(v) ? "'" : '') +
              v.replaceAll('"', '""') +
              '"',
          )
          .join(','),
      )
      .join('\r\n');
    const url = URL.createObjectURL(
      new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `bareeq-${day}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="staff-toolbar">
        <TextInput
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
        <Select value={branchId} onChange={(e) => setBranch(e.target.value)}>
          {menu.data?.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <UIButton className="button" disabled={!report.data} onClick={download}>
          Download CSV
        </UIButton>
      </div>
      <p>
        Sales from completed orders created on this café-local day. Cancelled,
        rejected and pending orders do not contribute to revenue. This is sales,
        not profit.
      </p>
      {report.isError && (
        <p role="alert">Report unavailable. Try again when connected.</p>
      )}
      {report.data && (
        <>
          <div className="report-grid">
            {Object.entries(report.data)
              .filter(([k]) => !['day', 'timezone', 'top_products'].includes(k))
              .map(([k, v]) => (
                <article key={k}>
                  <p>{k.replaceAll('_minor', '').replaceAll('_', ' ')}</p>
                  <h2>{k.endsWith('minor') ? money(Number(v)) : String(v)}</h2>
                </article>
              ))}
          </div>
          <h2>Most loved today</h2>
          <DataTable
            columns={[
              {
                key: 'product',
                header: 'Product',
                cell: (p: any) => p.product_name,
              },
              {
                key: 'quantity',
                header: 'Sold',
                align: 'end',
                cell: (p: any) => p.quantity,
              },
              {
                key: 'revenue',
                header: 'Revenue',
                align: 'end',
                cell: (p: any) => money(p.revenue_minor),
              },
            ]}
            rows={report.data.top_products}
            empty="No completed orders on this day."
          />
        </>
      )}
    </>
  );
}

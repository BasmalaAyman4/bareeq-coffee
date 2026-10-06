import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export type DataColumn<Row> = {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  align?: 'start' | 'end';
};
export function DataTable<Row extends { id?: string | number }>({
  columns,
  rows,
  empty = 'Nothing to show yet.',
}: {
  columns: DataColumn<Row>[];
  rows: Row[];
  empty?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-bareeq-espresso/12 bg-white">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm text-bareeq-espresso">
        <thead className="bg-bareeq-cream/55 text-xs uppercase tracking-[0.08em] text-bareeq-espresso/65">
          <tr>
            {columns.map((column) => (
              <th
                className={cn(
                  'px-4 py-3 font-bold',
                  column.align === 'end' && 'text-right',
                )}
                key={column.key}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                className="border-t border-bareeq-espresso/8"
                key={row.id ?? index}
              >
                {columns.map((column) => (
                  <td
                    className={cn(
                      'px-4 py-3.5',
                      column.align === 'end' && 'text-right',
                    )}
                    key={column.key}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="px-4 py-10 text-center text-bareeq-espresso/60"
                colSpan={columns.length}
              >
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

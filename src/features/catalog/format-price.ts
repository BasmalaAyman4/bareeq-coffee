import site from '@/data/site.json';
export function price(value: number | null) {
  if (value === null) return 'Confirm with café';
  return (
    new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value) +
    (site.currency ? ' ' + site.currency : '')
  );
}

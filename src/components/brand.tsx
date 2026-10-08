import { useCopy } from '@/i18n/i18n-provider';
export function Brand() {
  const tr = useCopy();

  return (
    <img
      className="brand-logo"
      src="/assets/bareeq-logo.png"
      alt={tr('Bareeq — بريق')}
      width="591"
      height="591"
    />
  );
}

import { useCopy } from '@/i18n/i18n-provider';
import { useMenu } from '../hooks/use-menu';
export function MenuStatus() {
  const tr = useCopy();

  const menu = useMenu();
  if (menu.isError)
    return (
      <div className="wrap backend-notice" role="alert">
        {tr('The menu could not be loaded.')}{' '}
        <button onClick={() => menu.refetch()}>{tr('Try again')}</button>
      </div>
    );
  if (menu.isPending)
    return (
      <div className="wrap backend-notice" role="status">
        {tr('Loading the Bareeq menu…')}
      </div>
    );
  return null;
}

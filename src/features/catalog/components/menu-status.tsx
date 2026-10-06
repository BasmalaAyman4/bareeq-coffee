import { useMenu } from '../hooks/use-menu';
export function MenuStatus() {
  const menu = useMenu();
  if (menu.isError)
    return (
      <div className="wrap backend-notice" role="alert">
        The menu could not be loaded.{' '}
        <button onClick={() => menu.refetch()}>Try again</button>
      </div>
    );
  if (menu.isPending)
    return (
      <div className="wrap backend-notice" role="status">
        Loading the Bareeq menu…
      </div>
    );
  return null;
}

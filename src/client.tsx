import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app';
import { ServerPath } from './router';
const app = (
  <ServerPath.Provider value={location.pathname}>
    <App />
  </ServerPath.Provider>
);
// Staff pages depend on an auth session and browser-only Supabase state. They
// intentionally render a fresh client tree so a stale static login shell can
// never cause a React hydration mismatch after deployment.
const appPath = location.pathname.replace(/^\/bareeq-coffee/, '') || '/';
if (/^\/(dashboard|founder|cashier)(\/|$)/.test(appPath)) {
  createRoot(document.getElementById('root')!).render(app);
} else {
  hydrateRoot(document.getElementById('root')!, app);
}

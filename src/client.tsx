import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app';
import { ServerPath } from './router';
const rawPath =
  location.hash.replace(/^#/, '') ||
  location.pathname.replace(/^\/bareeq-coffee/, '') ||
  '/';
const appPath = rawPath.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';
const app = (
  <ServerPath.Provider value={appPath}>
    <App />
  </ServerPath.Provider>
);
// Staff pages depend on an auth session and browser-only Supabase state. They
// intentionally render a fresh client tree so a stale static login shell can
// never cause a React hydration mismatch after deployment.
if (/^\/(dashboard|founder|cashier)(\/|$)/.test(appPath)) {
  createRoot(document.getElementById('root')!).render(app);
} else {
  hydrateRoot(document.getElementById('root')!, app);
}

import { hydrateRoot } from 'react-dom/client';
import { App } from './app';
import { ServerPath } from './router';
hydrateRoot(
  document.getElementById('root')!,
  <ServerPath.Provider value={location.pathname}>
    <App />
  </ServerPath.Provider>,
);

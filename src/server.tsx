import { renderToString } from 'react-dom/server';
import { App } from './app';
import { ServerPath } from './router';
export { pageTitles } from './routes';
export function render(path: string) {
  return renderToString(
    <ServerPath.Provider value={path}>
      <App />
    </ServerPath.Provider>,
  );
}

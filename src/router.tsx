import React, { createContext, useContext, useSyncExternalStore } from 'react';
export const ServerPath = createContext('/');
const basePath = () =>
  typeof window !== 'undefined' &&
  window.location.pathname.startsWith('/bareeq-coffee')
    ? '/bareeq-coffee'
    : '';
const subscribe = (fn: () => void) => {
  window.addEventListener('popstate', fn);
  return () => window.removeEventListener('popstate', fn);
};
export function usePathname() {
  const initial = useContext(ServerPath);
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname.replace(basePath(), '') || '/',
    () => initial,
  );
}
export default function Link({
  href,
  onClick,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={basePath() + href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          rest.target ||
          !href.startsWith('/')
        )
          return;
        e.preventDefault();
        history.pushState({}, '', basePath() + href);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo(0, 0);
        document.getElementById('main')?.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}

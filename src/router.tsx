import React, { createContext, useContext, useSyncExternalStore } from 'react';
export const ServerPath = createContext('/');
const basePath = () =>
  typeof window !== 'undefined' &&
  window.location.pathname.startsWith('/bareeq-coffee')
    ? '/bareeq-coffee'
    : '';
const subscribe = (fn: () => void) => {
  window.addEventListener('popstate', fn);
  window.addEventListener('hashchange', fn);
  return () => {
    window.removeEventListener('popstate', fn);
    window.removeEventListener('hashchange', fn);
  };
};
export function usePathname() {
  const initial = useContext(ServerPath);
  const clientPath = () => {
    const hash = window.location.hash.replace(/^#/, '');
    return (
      (hash.startsWith('/')
        ? hash
        : window.location.pathname.replace(basePath(), '')) || '/'
    );
  };
  return useSyncExternalStore(subscribe, clientPath, () => initial);
}
export default function Link({
  href,
  onClick,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const useHash =
    typeof window !== 'undefined' && window.location.hash.startsWith('#/');
  return (
    <a
      href={
        useHash && href.startsWith('/')
          ? `${basePath()}/#${href}`
          : basePath() + href
      }
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
        if (useHash) {
          window.location.hash = href;
          return;
        }
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

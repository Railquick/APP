import { useEffect, useState } from 'react';

export type AppRoute = '/' | '/home' | '/journey' | '/essentials' | '/login' | '/coming-soon' | '/account';

const EVENT = 'railquick:navigate';

export function navigate(path: AppRoute, replace = false): void {
  const current = window.location.pathname;
  if (current === path) return;
  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
  window.dispatchEvent(new Event(EVENT));
}

export function usePath(): string {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener('popstate', update);
    window.addEventListener(EVENT, update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(EVENT, update);
    };
  }, []);
  return path;
}

export function routeFor(authenticated: boolean): AppRoute {
  return authenticated ? '/' : '/login';
}

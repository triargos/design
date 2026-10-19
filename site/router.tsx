import { createContext, startTransition, use, useEffect, useState, type ComponentProps, type MouseEvent } from 'react';

interface Router {
  readonly pathname: string;
  readonly navigate: (to: string) => void;
}

const RouterContext = createContext<Router>({ pathname: '/', navigate: () => undefined });

/**
 * Client-side routing over prerendered pages. Navigation is a transition: the current page stays on screen while the
 * next one's chunk loads, instead of a fallback.
 */
export function RouterProvider({ initialPathname, children }: { initialPathname: string; children: React.ReactNode }) {
  const [pathname, setPathname] = useState(initialPathname);

  useEffect(() => {
    const onPopState = () => startTransition(() => setPathname(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to: string) => {
    if (to === pathname) return;
    window.history.pushState(null, '', to);
    startTransition(() => setPathname(to));
  };

  return <RouterContext value={{ pathname, navigate }}>{children}</RouterContext>;
}

export const useRouter = (): Router => use(RouterContext);

/** An in-app `<a>`: navigates client-side unless a modifier asks for a new tab; `prefetch` runs on hover and focus. */
export function Link({ prefetch, onClick, ...props }: ComponentProps<'a'> & { href: string; prefetch?: () => void }) {
  const { navigate } = useRouter();
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(event.currentTarget.pathname);
  };
  return <a {...props} onClick={click} onPointerEnter={prefetch} onFocus={prefetch} />;
}

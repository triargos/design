import type { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

/** The app's router link: takes an `<a>`'s props, `href` included, and navigates without a page load. */
type LinkComponent = React.ComponentType<React.ComponentPropsWithRef<'a'>>;

const LinkContext = React.createContext<LinkComponent | null>(null);

/**
 * The link every linking part renders (`BreadcrumbLink`, `TabsLink`, `TableRowLink`, `SidebarMenuSubButton`,
 * `BottomNavLink`, `BottomNavMoreItem`) instead of a plain `<a>`, so `href` routes client-side without a `render` on
 * each. A part's own `render` still wins. Map `href` to the router's prop in the component you pass.
 */
function LinkProvider({ component, children }: { component: LinkComponent | null; children: React.ReactNode }) {
  return <LinkContext value={component}>{children}</LinkContext>;
}

/** The part's own `render`, else the provider's link, else nothing (a plain `<a>`). */
function useLinkRender(render: useRender.ComponentProps<'a'>['render']): useRender.ComponentProps<'a'>['render'] {
  const Link = React.use(LinkContext);
  return render ?? (Link === null ? undefined : <Link />);
}

export { LinkProvider, useLinkRender, type LinkComponent };

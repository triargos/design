import * as React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { LinkProvider } from '~/components/ui/link';
import { TabsLink, TabsNav } from '~/components/ui/tabs';

const NavigateContext = React.createContext<(href: string) => void>(() => undefined);

/** Stands in for the router's link, e.g. `<Link to={href} />` from TanStack Router or React Router. */
function RouterLink({ href = '', onClick, ...props }: React.ComponentPropsWithRef<'a'>) {
  const navigate = React.use(NavigateContext);
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}

/** One `LinkProvider` (or `PavoProvider link`): every `href` below goes through the router. */
export function PavoProviderRouterLinks() {
  const [path, setPath] = React.useState('/projects/website-redesign');
  return (
    <NavigateContext value={setPath}>
      <LinkProvider component={RouterLink}>
        <div className='flex flex-col gap-group'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='/'>Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href='/projects'>Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Website redesign</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <TabsNav>
            <TabsLink href='/projects/website-redesign' current={path === '/projects/website-redesign'}>
              Overview
            </TabsLink>
            <TabsLink href='/projects/website-redesign/tasks' current={path === '/projects/website-redesign/tasks'}>
              Tasks
            </TabsLink>
          </TabsNav>
          <p className='text-caption text-muted-foreground'>
            Router at <span className='font-mono'>{path}</span>
          </p>
        </div>
      </LinkProvider>
    </NavigateContext>
  );
}

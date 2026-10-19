import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import pages, { type DocsPage as DocsPageEntry } from 'virtual:docs-index';

import { Button } from '~/components/ui/button';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '~/components/ui/item';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { Skeleton } from '~/components/ui/skeleton';

import { cn } from '~/lib/utils';

import { FoundationPage } from '../storybook/kit/blocks';
import { CustomizationStyles, CustomizeSheet } from './customize';
import { Home } from './home';
import { DocsSidebar, Wordmark } from './nav';
import { DocsPage, pageAt, pathOf, prefetchPage } from './page';
import { Link, useRouter } from './router';

const TITLE = 'Triargos Design';

function PageLink({ page, rel }: { page: DocsPageEntry; rel: 'prev' | 'next' }) {
  const Icon = rel === 'prev' ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <Item
      render={<Link href={pathOf(page)} rel={rel} prefetch={prefetchPage(page)} />}
      className={cn('flex-1 flex-nowrap border-border', rel === 'next' && 'flex-row-reverse text-end')}>
      <ItemMedia>
        <Icon aria-hidden className='size-4 text-muted-foreground rtl:-scale-x-100' />
      </ItemMedia>
      <ItemContent className={cn('min-w-0 gap-0', rel === 'next' && 'items-end')}>
        <ItemDescription className='text-caption'>{rel === 'prev' ? 'Previous' : 'Next'}</ItemDescription>
        <ItemTitle>{page.name}</ItemTitle>
      </ItemContent>
    </Item>
  );
}

/** Previous and next page, in sidebar order. */
function PageNav({ page }: { page: DocsPageEntry }) {
  const index = pages.indexOf(page);
  const previous = pages[index - 1];
  const next = pages[index + 1];
  return (
    <nav aria-label='Previous and next page' className='mx-auto mt-section flex w-full max-w-3xl gap-related'>
      {previous ? <PageLink page={previous} rel='prev' /> : <span className='flex-1' />}
      {next ? <PageLink page={next} rel='next' /> : <span className='flex-1' />}
    </nav>
  );
}

function NotFound() {
  return (
    <FoundationPage
      title='Page not found'
      description='This address has no page. Pick one from the menu, or search with ⌘K.'>
      <div>
        <Button intent='neutral' emphasis='raised' render={<Link href='/' />}>
          Go to the introduction
        </Button>
      </div>
    </FoundationPage>
  );
}

function Loading() {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-page' aria-busy='true'>
      <Skeleton className='h-6 w-40' />
      <Skeleton className='h-40 w-full' />
    </div>
  );
}

/** Scrolls the page panel to the top and moves focus to it on client navigation, as a full page load would. */
function useResetOnNavigate(pathname: string) {
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);
  return main;
}

/**
 * The dashboard's frame (`main-layout.tsx`): a viewport-high shell, the sidebar on it, and the page panel beside it that
 * scrolls on its own. On mobile the sidebar is a sheet the header's trigger opens.
 */
export function App() {
  const { pathname } = useRouter();
  const page = pageAt(pathname);
  const main = useResetOnNavigate(pathname);

  useEffect(() => {
    document.title = page ? `${page.name} · ${TITLE}` : pathname === '/' ? TITLE : `Page not found · ${TITLE}`;
  }, [page, pathname]);

  return (
    <>
      <CustomizationStyles />
      <SidebarProvider>
        <a
          href='#content'
          className='sr-only z-50 rounded-control bg-background px-3 py-2 text-body shadow-md focus:not-sr-only focus:fixed focus:start-3 focus:top-3'>
          Skip to content
        </a>
        <div className='relative flex h-dvh w-screen flex-col bg-sidebar font-sans antialiased'>
          <header className='flex h-14 shrink-0 items-center gap-related px-3 md:hidden'>
            <SidebarTrigger />
            <Wordmark />
          </header>
          <div className='flex h-full min-h-0 shrink md:py-3 md:pe-3'>
            <DocsSidebar />
            <div className='relative h-full min-w-0 flex-1'>
              <main
                id='content'
                ref={main}
                tabIndex={-1}
                className='relative h-full w-full [scrollbar-gutter:stable] overflow-y-auto overscroll-none bg-background text-foreground shadow-md ring ring-border/50 outline-none md:rounded-panel'>
                <div className='px-5 pt-12 pb-28 md:px-10'>
                  <Suspense fallback={<Loading />}>
                    {pathname === '/' ? <Home /> : page ? <DocsPage key={page.slug} page={page} /> : <NotFound />}
                  </Suspense>
                  {page && <PageNav page={page} />}
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
      <CustomizeSheet />
    </>
  );
}

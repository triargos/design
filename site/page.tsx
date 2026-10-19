import { composeStories } from '@storybook/react-vite';
import { use, type ComponentType, type MouseEvent } from 'react';
import pages, { type DocsPage as DocsPageEntry } from 'virtual:docs-index';

import { ExampleSourceContext } from '../storybook/kit/blocks';

type StoryModule = Parameters<typeof composeStories>[0];
type Story = ComponentType & { load: () => Promise<void> };

const storyModules = import.meta.glob<StoryModule>('../storybook/{foundations,components,patterns}/*.stories.tsx');
const exampleSources = import.meta.glob<string>('../storybook/examples/**/*.tsx', { query: '?raw', import: 'default' });

export const pathOf = (page: DocsPageEntry) => `/${page.slug}`;
export const pageAt = (pathname: string) => pages.find((page) => pathOf(page) === pathname);

/** Example files live in `examples/<entry>/`, a pattern's in `examples/patterns/<entry>/`. */
const examplesDir = (page: DocsPageEntry) =>
  page.group === 'Patterns' ? `../storybook/examples/patterns/${page.slug}/` : `../storybook/examples/${page.slug}/`;

const sectionSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

interface LoadedPage {
  /** The story file's `Board` (a foundation's only story), composed with its meta. */
  readonly Board: Story | undefined;
  /** Example sources by file slug (`with-icon`). */
  readonly sources: ReadonlyMap<string, string>;
}

const loaded = new Map<string, Promise<LoadedPage>>();

/**
 * Loads a page's story module and all its example sources at once, so the page renders whole. Runs the story's loaders
 * and `beforeEach` (`Copy Button` stubs the clipboard there) in the browser, as Storybook does. Cached per page.
 */
export function loadPage(page: DocsPageEntry): Promise<LoadedPage> {
  let promise = loaded.get(page.slug);
  if (promise !== undefined) return promise;
  const loadModule = storyModules[page.module];
  if (loadModule === undefined) throw new Error(`No story module at ${page.module}`);
  const dir = examplesDir(page);
  const sourcePaths = Object.keys(exampleSources).filter(
    (path) => path.startsWith(dir) && !path.slice(dir.length).includes('/'),
  );
  const tracked: Promise<LoadedPage> = Promise.all([
    loadModule(),
    Promise.all(
      sourcePaths.map(async (path) => [path.slice(dir.length, -'.tsx'.length), await exampleSources[path]!()] as const),
    ),
  ]).then(async ([module, sources]) => {
    const stories = composeStories(module) as Record<string, Story>;
    const Board = stories['Board'] ?? Object.values(stories)[0];
    await Board?.load();
    const value: LoadedPage = { Board, sources: new Map(sources) };
    // `use` reads a settled promise's `status` and `value` and renders without suspending: hydration and prefetched
    // navigation never show the fallback.
    Object.assign(tracked, { status: 'fulfilled', value });
    return value;
  });
  promise = tracked;
  loaded.set(page.slug, promise);
  return promise;
}

/** Starts loading a page ahead of navigation (link hover and focus). */
export const prefetchPage = (page: DocsPageEntry) => () => void loadPage(page);

/**
 * Examples link with real paths (`href='/members'`), which are not docs pages. Stops those clicks; hash links and
 * external URLs still work.
 */
const stayOnPage = (event: MouseEvent<HTMLDivElement>) => {
  const link = event.target instanceof Element ? event.target.closest('a[href^="/"]') : null;
  if (link) event.preventDefault();
};

/** A page's `Board`, with each example's source behind "Show code". */
export function DocsPage({ page }: { page: DocsPageEntry }) {
  const { Board, sources } = use(loadPage(page));
  if (Board === undefined) return null;
  return (
    <ExampleSourceContext value={(section) => sources.get(sectionSlug(section))}>
      <div className='contents' onClickCapture={stayOnPage}>
        <Board />
      </div>
    </ExampleSourceContext>
  );
}

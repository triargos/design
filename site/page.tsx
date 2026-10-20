import { use, useLayoutEffect, type MouseEvent } from 'react';
import pages, { type DocsPage as DocsPageEntry } from 'virtual:docs-index';

import { DocsModeContext, ExampleSourceContext } from '../docs/kit/blocks';
import { type DocsModule, TokensContext } from '../docs/kit/docs';
import { useCustomization } from './customize';
import { Install } from './install';
import { controlsOf, Playground } from './playground';

const docsModules = import.meta.glob<DocsModule>('../docs/{foundations,components,patterns}/*.tsx', {
  import: 'default',
});
const exampleSources = import.meta.glob<string>('../docs/examples/**/*.tsx', { query: '?raw', import: 'default' });

export const pathOf = (page: DocsPageEntry) => `/${page.slug}`;
export const pageAt = (pathname: string) => pages.find((page) => pathOf(page) === pathname);

/** Example files live in `examples/<entry>/`, a pattern's in `examples/patterns/<entry>/`. */
const examplesDir = (page: DocsPageEntry) =>
  page.group === 'Patterns' ? `../docs/examples/patterns/${page.slug}/` : `../docs/examples/${page.slug}/`;

const sectionSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

interface LoadedPage {
  readonly docs: DocsModule;
  /** Example sources by file slug (`with-icon`). */
  readonly sources: ReadonlyMap<string, string>;
}

const loaded = new Map<string, Promise<LoadedPage>>();

/** Loads a page's docs module and all its example sources at once, so the page renders whole. Cached per page. */
export function loadPage(page: DocsPageEntry): Promise<LoadedPage> {
  let promise = loaded.get(page.slug);
  if (promise !== undefined) return promise;
  const loadModule = docsModules[page.module];
  if (loadModule === undefined) throw new Error(`No docs module at ${page.module}`);
  const dir = examplesDir(page);
  const sourcePaths = Object.keys(exampleSources).filter(
    (path) => path.startsWith(dir) && !path.slice(dir.length).includes('/'),
  );
  const tracked: Promise<LoadedPage> = Promise.all([
    loadModule(),
    Promise.all(
      sourcePaths.map(async (path) => [path.slice(dir.length, -'.tsx'.length), await exampleSources[path]!()] as const),
    ),
  ]).then(([docs, sources]) => {
    const value: LoadedPage = { docs, sources: new Map(sources) };
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

/**
 * A page. Foundations render their `Page` whole. Components and patterns render it in docs mode: the header, a live
 * Playground where the module has one, a component's install commands, then the examples with their code; the page's
 * spec sections stay out.
 */
export function DocsPage({ page }: { page: DocsPageEntry }) {
  const { docs, sources } = use(loadPage(page));
  const { surface, tokens } = useCustomization();
  // A layout effect runs before the page's own effects (`Copy Button` clicks its buttons in one), after children render.
  useLayoutEffect(() => docs.setup?.(), [docs]);
  const { Page, playground } = docs;
  const controls = playground === undefined ? [] : controlsOf(playground);
  const board = (
    <ExampleSourceContext value={(section) => sources.get(sectionSlug(section))}>
      <div className='contents' onClickCapture={stayOnPage}>
        <Page />
      </div>
    </ExampleSourceContext>
  );
  const mode =
    page.group === 'Foundations'
      ? { surface }
      : {
          afterHeader: (
            <>
              {playground !== undefined && controls.length > 0 && (
                <Playground name={docs.title.replace(/\s/g, '')} playground={playground} controls={controls} />
              )}
              {/* Every component page is a registry item of the same name (`scripts/registry.mjs`). */}
              {page.group === 'Components' && <Install name={page.slug} title={docs.title} />}
            </>
          ),
          hideSpecs: true,
          surface,
        };
  return (
    <TokensContext value={tokens}>
      <DocsModeContext value={mode}>{board}</DocsModeContext>
    </TokensContext>
  );
}

import { prerenderToNodeStream } from 'react-dom/static';
import pages from 'virtual:docs-index';

import { loadPage, pageAt, pathOf } from './page';
import { Root } from './root';

/** Every route the build writes: `/` → `index.html`, `/button` → `button.html`, `/404` → `404.html`. */
export const paths: ReadonlyArray<string> = ['/', ...pages.map(pathOf), '/404'];

const TITLE = 'Pavo';

/** Renders a route to HTML once its page has loaded; the build puts it into `index.html`'s `#root`. */
export async function render(pathname: string): Promise<{ html: string; title: string }> {
  const page = pageAt(pathname);
  if (page !== undefined) await loadPage(page);
  // Infinity: React outlines a Suspense boundary over ~12 KB into a hidden segment that a script swaps in, which would
  // leave the page blank without JS. Static HTML wants every boundary inline.
  const { prelude } = await prerenderToNodeStream(<Root pathname={pathname} />, { progressiveChunkSize: Infinity });
  const chunks: Array<Buffer> = [];
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
  const title = page ? `${page.name} · ${TITLE}` : pathname === '/404' ? `Not found · ${TITLE}` : TITLE;
  return { html: Buffer.concat(chunks).toString('utf8'), title };
}

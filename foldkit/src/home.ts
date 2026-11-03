import { Array } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { page } from './kit.ts';

type HomeNavItem = Readonly<{ title: string; description: string; href: string }>;

export const homeView = <Message>(navItems: ReadonlyArray<HomeNavItem>, h: HtmlBuilder<Message>): Html =>
  page(
    {
      title: 'Pavo on Foldkit',
      description:
        'An experiment: the Pavo design system rebuilt on Foldkit and @foldkit/ui. Tokens, theme generator, cn and intent variants are shared with the React kit; only the components are rewritten.',
      sections: [
        h.ul(
          [h.Class('grid gap-related sm:grid-cols-2')],
          Array.map(navItems, ({ title, description, href }) =>
            h.li(
              [],
              [
                h.a(
                  [
                    h.Href(href),
                    h.Class(
                      'flex flex-col gap-tight rounded-block border border-border p-part transition-colors hover:bg-row-hover',
                    ),
                  ],
                  [
                    h.span([h.Class('text-body font-medium')], [title]),
                    h.span([h.Class('text-caption text-muted-foreground')], [description]),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    },
    h,
  );

export const notFoundView = <Message>(path: string, h: HtmlBuilder<Message>): Html =>
  page({ title: 'Page not found', description: `Nothing lives at /${path}.`, sections: [] }, h);

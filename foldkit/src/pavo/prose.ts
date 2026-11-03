import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';

export const proseVariants = (): string =>
  cn(
    'text-body text-pretty wrap-break-word text-foreground',
    '[&>*+*]:mt-[0.75em] [&>*+:is(h1,h2,h3,h4)]:mt-[1.5em] [&>:is(h1,h2,h3,h4)+*]:mt-[0.5em] [&>hr]:my-[1.5em]',
    '[&_:is(h1,h2,h3,h4)]:font-medium [&_:is(h1,h2,h3,h4)]:text-balance [&_:is(h1,h2,h3,h4)]:text-foreground [&_h1]:text-heading',
    '[&_:is(strong,b)]:font-medium',
    '[&_a]:rounded-control-xs [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-3 [&_a]:transition-[text-decoration-color] [&_a]:duration-feedback [&_a:focus-visible]:ring-3 [&_a:focus-visible]:ring-ring/24 [&_a:focus-visible]:outline-none [&_a:hover]:decoration-current',
    '[&_:not(pre)>code]:rounded-control-xs [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-(--prose-code-pad-x) [&_:not(pre)>code]:py-(--prose-code-pad-y) [&_:not(pre)>code]:text-caption',
    '[&_:is(ul,ol)]:ps-[1.5em] [&_ol]:list-decimal [&_ul]:list-disc [&_ul_ul]:list-[circle] marker:text-muted-foreground',
    '[&_li]:ps-[0.25em] [&_li+li]:mt-[0.25em] [&_li>:is(ul,ol)]:mt-[0.25em]',
    '[&_pre]:overflow-x-auto [&_pre]:rounded-area [&_pre]:bg-muted [&_pre]:p-(--prose-pre-pad) [&_pre]:text-caption [&_pre]:text-foreground',
    '[&_blockquote]:border-s-2 [&_blockquote]:border-border-strong [&_blockquote]:ps-[1em] [&_blockquote]:text-muted-foreground',
    '[&_hr]:border-border',
    '[&_img]:rounded-block',
    '[&_table]:w-full [&_:is(th,td)]:border-b [&_:is(th,td)]:py-[0.5em] [&_:is(th,td)]:pe-[1em] [&_:is(th,td)]:text-start [&_td]:border-border-subtle [&_th]:border-border [&_th]:font-medium [&_th]:text-foreground',
  );

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    html?: string | undefined;
  }>;

export const view = <Message>(
  { html, className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'prose'),
      h.Class(cn(proseVariants(), className)),
      ...(html === undefined ? [] : [h.InnerHTML(html)]),
      ...attributes,
    ],
    html === undefined ? children : [],
  );

import { cva } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '~/lib/utils';

/**
 * Rendered rich text: TipTap HTML, sanitized HTML, markdown. Body text in `foreground`; `text-muted-foreground` on
 * `className` for secondary copy (headings stay `foreground`). All spacing is in `em`, so it follows the text size.
 *
 * - `h1` is the heading role, `h2`–`h4` body size in medium. A heading has 1.5em above it and 0.5em below; other
 *   blocks sit 0.75em apart.
 * - Lists sit tight; TipTap's `<p>` in each `li` adds no space.
 * - Links underline in `foreground`; code and `pre` sit on `muted`; quotes and rules use the border tokens.
 *
 * Exported for an editor's editable element (TipTap `editorProps.attributes.class`), so it reads like the result.
 */
const proseVariants = cva([
  'text-body text-pretty wrap-break-word text-foreground',
  // Rhythm.
  '[&>*+*]:mt-[0.75em] [&>*+:is(h1,h2,h3,h4)]:mt-[1.5em] [&>:is(h1,h2,h3,h4)+*]:mt-[0.5em] [&>hr]:my-[1.5em]',
  // Headings.
  '[&_:is(h1,h2,h3,h4)]:font-medium [&_:is(h1,h2,h3,h4)]:text-balance [&_:is(h1,h2,h3,h4)]:text-foreground [&_h1]:text-heading',
  // Inline text.
  '[&_:is(strong,b)]:font-medium',
  '[&_a]:rounded-control-xs [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-3 [&_a]:transition-[text-decoration-color] [&_a]:duration-feedback [&_a:focus-visible]:ring-3 [&_a:focus-visible]:ring-ring/24 [&_a:focus-visible]:outline-none [&_a:hover]:decoration-current',
  '[&_:not(pre)>code]:rounded-control-xs [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-caption',
  // Lists.
  '[&_:is(ul,ol)]:ps-[1.5em] [&_ol]:list-decimal [&_ul]:list-disc [&_ul_ul]:list-[circle] marker:text-muted-foreground',
  '[&_li]:ps-[0.25em] [&_li+li]:mt-[0.25em] [&_li>:is(ul,ol)]:mt-[0.25em]',
  // Blocks.
  '[&_pre]:overflow-x-auto [&_pre]:rounded-control [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-caption [&_pre]:text-foreground',
  '[&_blockquote]:border-s-2 [&_blockquote]:border-border-strong [&_blockquote]:ps-[1em] [&_blockquote]:text-muted-foreground',
  '[&_hr]:border-border',
  '[&_img]:rounded-control-lg',
  '[&_table]:w-full [&_:is(th,td)]:border-b [&_:is(th,td)]:py-[0.5em] [&_:is(th,td)]:pe-[1em] [&_:is(th,td)]:text-start [&_td]:border-border-subtle [&_th]:border-border [&_th]:font-medium [&_th]:text-foreground',
]);

/** Rendered rich text in the body role: put the HTML or markdown output inside. */
function Prose({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='prose' className={cn(proseVariants(), className)} {...props} />;
}

export { Prose, proseVariants };

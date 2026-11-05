import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { type ComponentProps, type ReactNode, createContext, use } from 'react';

import { usePresence } from '~/hooks/use-presence';
import { cn } from '~/lib/utils';

// Two variants, one markup: `Card` > `CardHeader` > `CardContent` > `CardFooter`.
//
// `shell` (the default): a tinted shell (`--card-shell`, default `--shell`) around the content, the header and footer
// bands on the tint. The card is a grid (header, panel, footer rows) and its `::before`, a grid item over the rows,
// draws the tint: no wrapper, so the parts stay siblings. The content is a card of its own `card-inset` inside it:
// its `--edge` all round, `shadow-card`, `rounded-inner`, so it stays concentric at any card radius or inset. Bands
// pad `card` + 1px inside the inset, the content's text edge. Tables (`Table variant='card'`) and blocks that need
// their label inside take it. Without a header (and not around a table) a shell draws no tint: the content stands
// alone, as a plain surface.
//
// A table brings its own band, the column row, so a shell around one sets its header above the shell, as `plain`
// does: one band on top, and the title stays a heading. The tint then starts at row 2.
//
// `plain`, the exception: the header sits above the card, on the page, as a section title; the surface holds the
// content and the footer. The same grid, its `::before` the surface over the content and footer rows. Content and
// footer sit on one text edge, `card` in from the 1px edge; the header pads the same, so its title starts on that edge.
// The title floats `group` above an untinted surface, so the block reads looser than a shell: keep it for a block whose
// title is a page section heading.
//
// Without a `Card` around it, `CardContent` draws its own surface at `rounded-card` (a list under a plain section
// title).

type CardVariant = 'shell' | 'plain';

/** The variant of the card around a part; `null` outside a card. */
const CardVariantContext = createContext<CardVariant | null>(null);

/**
 * A content block. `shell` (the default): a tinted shell around the content, the header a title band inside it, or
 * above it over a table. Without a header (and not around a table) a shell draws no tint: the content is a plain
 * surface. `plain`: the header is the block's title, above the card; the card holds content and footer.
 * `intent='destructive'` marks only the title.
 */
function Card({
  className,
  variant = 'shell',
  intent = 'neutral',
  ...props
}: ComponentProps<'section'> & { variant?: CardVariant; intent?: 'neutral' | 'destructive' }) {
  return (
    <CardVariantContext value={variant}>
      <section
        data-slot='card'
        data-variant={variant}
        data-intent={intent}
        className={cn(
          'group/card rounded-card [--outer-radius:var(--radius-card)]',
          variant === 'plain'
            ? [
                // Every part in the one column: auto-placement would set a part beside the surface, never on it.
                'grid grid-cols-1 grid-rows-[auto_auto_auto] *:col-start-1 [--outer-inset:1px]',
                // The surface: an `--edge` border inside the box, `bg-clip-padding` keeps the fill off it.
                "before:col-start-1 before:row-start-2 before:row-end-4 before:rounded-card before:border before:border-(--edge) before:bg-card before:bg-clip-padding before:shadow-card before:content-['']",
              ]
            : [
                // Header, panel (`CardContent` or a table), footer: rows 1, 2, 3, each part placed, as the tint
                // fills every cell and would push an auto-placed part below it.
                'grid grid-cols-1 grid-rows-[auto_auto_auto] *:col-start-1 *:row-start-2 *:data-[slot=card-header]:row-start-1 *:data-[slot=card-footer]:row-start-3',
                '[--card-shell:var(--shell)] [--outer-inset:var(--spacing-card-inset)]',
                "before:col-start-1 before:row-start-1 before:row-end-4 before:rounded-card before:bg-(--card-shell) before:content-['']",
                'has-[>[data-slot=table-container]]:before:row-start-2',
                'not-has-[>[data-slot=card-header]]:not-has-[>[data-slot=table-container]]:before:hidden',
              ],
          className,
        )}
        {...props}
      />
    </CardVariantContext>
  );
}

/**
 * Title and description, `actions` at the end. `plain`, and outside a card: the block's title on the page, `group` above the card,
 * actions centred on the text and wrapping below it on a narrow screen. `shell`: a title band on the tint, `card-band`
 * above and below, the description `tight` under the title; keep it to one sentence. Both start `card` inside the
 * card's 1px edge, so the title starts on the content's text edge and the actions end where row actions do.
 */
function CardHeader({ className, actions, children, ...props }: ComponentProps<'div'> & { actions?: ReactNode }) {
  const variant = use(CardVariantContext) ?? 'plain';
  if (variant === 'plain') {
    return (
      <div
        data-slot='card-header'
        className={cn(
          'row-start-1 flex flex-wrap items-center justify-between gap-x-group gap-y-related px-[calc(var(--spacing-card)+1px)] pb-group',
          className,
        )}
        {...props}>
        <div className='flex min-w-0 flex-1 basis-64 flex-col gap-tight'>{children}</div>
        {actions !== undefined && <div className='flex shrink-0 items-center gap-related'>{actions}</div>}
      </div>
    );
  }
  // Over a table: above the shell, as `plain` (the `group-has` classes).
  const overTable = [
    'group-has-[>[data-slot=table-container]]/card:m-0 group-has-[>[data-slot=table-container]]/card:px-[calc(var(--spacing-card)+var(--spacing-card-inset)+1px)]',
    'group-has-[>[data-slot=table-container]]/card:pt-0 group-has-[>[data-slot=table-container]]/card:pb-group',
  ];
  if (actions === undefined) {
    return (
      <div
        data-slot='card-header'
        className={cn(
          'mx-card-inset mt-card-inset flex flex-col gap-tight px-[calc(var(--spacing-card)+1px)] py-card-band',
          overTable,
          className,
        )}
        {...props}>
        {children}
      </div>
    );
  }
  return (
    <div
      data-slot='card-header'
      className={cn(
        'mx-card-inset mt-card-inset flex items-center justify-between gap-group px-[calc(var(--spacing-card)+1px)] py-card-band',
        overTable,
        className,
      )}
      {...props}>
      <div className='flex min-w-0 flex-col gap-tight'>{children}</div>
      {/* Negative margin: `control-sm` actions overhang the title's 24px line instead of growing the band, so a
          header is as tall with actions as without. Above a table the title is a heading, tall enough for them. */}
      <div className='-my-[calc((var(--spacing-control-sm)-1.5rem)/2)] flex shrink-0 items-center gap-related group-has-[>[data-slot=table-container]]/card:my-0'>
        {actions}
      </div>
    </div>
  );
}

/**
 * Springs open and closed with `show`. `plain`: a `muted` band under a rule, as `DialogFooter`, in the card's bottom
 * corners. `shell`: the header band mirrored, on the tint.
 */
function CardFooter({ className, show = true, children, ...props }: ComponentProps<'div'> & { show?: boolean }) {
  const variant = use(CardVariantContext);
  const presence = usePresence<HTMLDivElement>(show);
  if (!presence.mounted) return null;
  return (
    // grid-template-rows (0fr ↔ 1fr), not height: a fold to `auto` without measuring.
    <div
      ref={presence.ref}
      data-slot='card-footer'
      data-surface={variant === 'plain' ? 'card' : undefined}
      data-leaving={presence.leaving || undefined}
      className={cn(
        'grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-fold ease-spring-bounce',
        'data-leaving:opacity-0 data-leaving:duration-fold-sm data-leaving:ease-spring motion-safe:data-leaving:grid-rows-[0fr]',
        'motion-reduce:duration-fold-sm motion-reduce:ease-enter',
        presence.entering && 'starting:opacity-0 motion-safe:starting:grid-rows-[0fr]',
        variant === 'plain' && 'row-start-3 mx-px mb-px rounded-b-inner border-t bg-muted',
        variant === 'shell' && 'mx-card-inset mb-card-inset',
      )}>
      {/* min-h-0: grid items default to min-height:auto and would refuse to collapse to 0fr. */}
      <div className='min-h-0 overflow-hidden'>
        {/* A margin on the child, not padding on the grid item: padding floors the grid track and the fold stalls
          before unmount. */}
        <div
          className={cn(
            variant === 'shell' ? 'mx-[calc(var(--spacing-card)+1px)] my-card-band' : 'mx-card my-card-band',
            className,
          )}
          {...props}>
          {children}
        </div>
      </div>
    </div>
  );
}

function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  const variant = use(CardVariantContext) ?? 'plain';
  return (
    <h2
      data-slot='card-title'
      className={cn(
        // `plain`, and a shell's over a table: a section title, the heading role. `shell`: the subheading, a step
        // below a section title and above the 14px row titles.
        variant === 'plain'
          ? 'text-heading'
          : 'text-subheading group-has-[>[data-slot=table-container]]/card:text-heading',
        'text-balance group-data-[intent=destructive]/card:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

// overflow-hidden clips the selection highlight to the paragraph; without it the gap between wrapped lines is painted
// to the page edge when a drag starts outside the text.
function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='card-description'
      className={cn('max-w-prose overflow-hidden text-body text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

/**
 * The card's content. In a `plain` card it is a region of the surface: no padding of its own (`p-card` for text and
 * fields, none for a list that runs to the edge), 1px in from the surface's edge, corners that clip a list to the
 * card's. In a `shell` card it is that surface `card-inset` inside the tint, `rounded-inner` (see the top of this file).
 * Alone, or in a shell without a header, it is a surface of its own at `rounded-card`. Either way an `--edge` border
 * inside the box (`bg-clip-padding` keeps the fill off it), `shadow-card`.
 */
function CardContent({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  const variant = use(CardVariantContext);
  return useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'card-content', surface: 'card' },
    props: mergeProps<'div'>(
      {
        className: cn(
          variant === 'plain'
            ? 'row-start-2 mx-px mt-px rounded-t-inner [&:not(:has(+[data-slot=card-footer]))]:mb-px [&:not(:has(+[data-slot=card-footer]))]:rounded-b-inner'
            : variant === 'shell'
              ? [
                  'mx-card-inset mt-card-inset mb-card-inset rounded-inner border border-(--edge) bg-card bg-clip-padding shadow-card',
                  '[[data-slot=card-header]+&]:mt-0 [&:has(+[data-slot=card-footer])]:mb-0',
                  '[[data-slot=card]:not(:has(>[data-slot=card-header]))>&]:m-0 [[data-slot=card]:not(:has(>[data-slot=card-header]))>&]:rounded-card',
                ]
              : 'rounded-card border border-(--edge) bg-card bg-clip-padding shadow-card',
          className,
        ),
      },
      props,
    ),
  });
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

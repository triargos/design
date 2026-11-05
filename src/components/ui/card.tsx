import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { type ComponentProps, type ReactNode, createContext, use } from 'react';

import { usePresence } from '~/hooks/use-presence';
import { cn } from '~/lib/utils';

// Two variants, one markup: `Card` > `CardHeader` > `CardContent` > `CardFooter`.
//
// `default`: the header sits above the card, on the page, as a section title; the surface holds the content and the
// footer. The card is a grid (header, content, footer rows) and its `::before`, a grid item over the content and footer
// rows, draws the surface: no wrapper, so the parts stay siblings. Content and footer sit on one text edge, `card` in
// from the 1px edge; the header pads the same, so its title starts on that edge.
//
// `shell`: a frame. One bordered card tinted with the shell (`--card-shell`, default `--shell`), the header and footer
// bands on the tint and the content a `bg-card` panel between them. The content runs 1px out on the sides (`-mx-px`),
// so its edge lies on the frame's, and the frame clips that column (`overflow-clip`, so a sticky table header still
// sticks to the page): one edge on the sides, the content's own edge only where it meets a band, its corners rounded
// there (`rounded-block`). At the frame's top or bottom it runs out there too and the frame's corner clips it. Tables
// (`Table variant='card'`) and blocks that need their label inside take it. Bands pad `card`, the content's text edge.
//
// Without a `Card` around it, `CardContent` draws its own surface at `rounded-card` (a list under a plain section
// title).

type CardVariant = 'default' | 'shell';

/** The variant of the card around a part; `null` outside a card. */
const CardVariantContext = createContext<CardVariant | null>(null);

/**
 * A content block. `default`: the header is the block's title, above the card; the card holds content and footer.
 * `shell`: a frame, the header a label strip inside it. `intent='destructive'` marks only the title.
 */
function Card({
  className,
  variant = 'default',
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
          variant === 'default'
            ? [
                // Every part in the one column: auto-placement would set a part beside the surface, never on it.
                'grid grid-cols-1 grid-rows-[auto_auto_auto] *:col-start-1 [--outer-inset:1px]',
                // The surface: an `--edge` border inside the box, `bg-clip-padding` keeps the fill off it.
                "before:col-start-1 before:row-start-2 before:row-end-4 before:rounded-card before:border before:border-(--edge) before:bg-card before:bg-clip-padding before:shadow-card before:content-['']",
              ]
            : 'flex flex-col overflow-clip border border-(--edge) bg-(--card-shell) bg-clip-padding shadow-card [--card-shell:var(--shell)] [--outer-inset:1px]',
          className,
        )}
        {...props}
      />
    </CardVariantContext>
  );
}

/**
 * Title and description, `actions` at the end. `default`: the block's title on the page, `group` above the card,
 * actions centred on the text and wrapping below it on a narrow screen. `shell`: a one-line label band on the tint,
 * `group` above and below; keep descriptions to one sentence. Both start `card` inside the card's 1px edge, so the
 * title starts on the content's text edge and the actions end where row actions do.
 */
function CardHeader({ className, actions, children, ...props }: ComponentProps<'div'> & { actions?: ReactNode }) {
  const variant = use(CardVariantContext) ?? 'default';
  if (variant === 'default') {
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
  if (actions === undefined) {
    return (
      <div data-slot='card-header' className={cn('px-card py-group', className)} {...props}>
        {children}
      </div>
    );
  }
  return (
    <div
      data-slot='card-header'
      className={cn('flex items-center justify-between gap-group px-card py-group', className)}
      {...props}>
      <div className='min-w-0'>{children}</div>
      {/* Negative margin: `control-sm` actions overhang the title's 20px line instead of growing the strip, so a
          header is as tall with actions as without. */}
      <div className='-my-[calc((var(--spacing-control-sm)-1.25rem)/2)] flex shrink-0 items-center gap-related'>
        {actions}
      </div>
    </div>
  );
}

/**
 * Springs open and closed with `show`. `default`: a `muted` band under a rule, as `DialogFooter`, in the card's bottom
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
      data-surface={variant === 'default' ? 'card' : undefined}
      data-leaving={presence.leaving || undefined}
      className={cn(
        'grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-fold ease-spring-bounce',
        'data-leaving:opacity-0 data-leaving:duration-fold-sm data-leaving:ease-spring motion-safe:data-leaving:grid-rows-[0fr]',
        'motion-reduce:duration-fold-sm motion-reduce:ease-enter',
        presence.entering && 'starting:opacity-0 motion-safe:starting:grid-rows-[0fr]',
        variant === 'default' && 'row-start-3 mx-px mb-px rounded-b-inner border-t bg-muted',
      )}>
      {/* min-h-0: grid items default to min-height:auto and would refuse to collapse to 0fr. */}
      <div className='min-h-0 overflow-hidden'>
        {/* A margin on the child, not padding on the grid item: padding floors the grid track and the fold stalls
          before unmount. */}
        <div className={cn('mx-card my-group', className)} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
}

function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  const variant = use(CardVariantContext) ?? 'default';
  return (
    <h2
      data-slot='card-title'
      className={cn(
        // `default`: a section title, the heading role. `shell`: body semibold, a compact label for the strip, heavier
        // than row titles.
        variant === 'default' ? 'text-heading' : 'text-body font-semibold',
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
 * The card's content. In a `default` card it is a region of the surface: no padding of its own (`p-card` for text and
 * fields, none for a list that runs to the edge), 1px in from the surface's edge, corners that clip a list to the
 * card's. In a `shell` card it is the panel between the bands (see the top of this file). Alone it is a surface of its
 * own: an `--edge` border inside the box (`bg-clip-padding` keeps the fill off it), `shadow-card`.
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
          variant === 'default'
            ? 'row-start-2 mx-px mt-px rounded-t-inner [&:not(:has(+[data-slot=card-footer]))]:mb-px [&:not(:has(+[data-slot=card-footer]))]:rounded-b-inner'
            : variant === 'shell'
              ? '-mx-px border border-(--edge) bg-card bg-clip-padding first:-mt-px last:-mb-px not-first:rounded-t-block not-last:rounded-b-block'
              : 'rounded-card border border-(--edge) bg-card bg-clip-padding shadow-card',
          className,
        ),
      },
      props,
    ),
  });
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

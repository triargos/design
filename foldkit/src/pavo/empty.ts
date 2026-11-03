import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';

export type EmptySize = 'default' | 'sm';

const SIZE_CLASS: Record<EmptySize, string> = {
  default: 'px-(--empty-pad-x) py-(--empty-pad-y)',
  sm: 'px-(--empty-pad-x-sm) py-(--empty-pad-y-sm)',
};

const ENTER_CLASS =
  '*:animate-in *:fade-in *:slide-in-from-bottom-1.5 *:fill-mode-backwards *:duration-300 *:ease-spring *:nth-2:[--tw-animation-delay:100ms] *:nth-3:[--tw-animation-delay:200ms] *:nth-4:[--tw-animation-delay:300ms] *:nth-5:[--tw-animation-delay:400ms] motion-reduce:*:animate-none';

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    size?: EmptySize | undefined;
    isBordered?: boolean | undefined;
  }>;

export const view = <Message>(
  { size = 'default', isBordered = false, className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'empty'),
      h.Class(
        cn(
          'group/empty flex min-w-0 flex-1 flex-col items-center justify-center text-center',
          SIZE_CLASS[size],
          isBordered && 'rounded-card border border-dashed border-border',
          ENTER_CLASS,
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

const backLayer = <Message>(restClassName: string, layerClassName: string, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Class(
        cn(
          'absolute inset-x-0 bottom-0 h-14 animate-in fill-mode-backwards duration-300 ease-spring [--tw-animation-delay:120ms] [--tw-enter-translate-y:0px] motion-reduce:animate-none',
          restClassName,
        ),
      ),
    ],
    [
      h.div([
        h.Class(
          cn(
            'size-full rounded-block border border-(--edge-field) bg-clip-padding shadow-field transition-transform duration-move ease-move motion-reduce:transition-none',
            layerClassName,
          ),
        ),
      ]),
    ],
  );

const skeletonStack = <Message>(h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('relative h-18 w-40')],
    [
      backLayer(
        '[transform:translateY(-16px)]',
        'scale-x-[0.84] bg-[color-mix(in_oklch,var(--card),var(--foreground)_9%)] group-hover/empty:-translate-y-2 dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_4%)]',
        h,
      ),
      backLayer(
        '[transform:translateY(-8px)]',
        'scale-x-[0.92] bg-[color-mix(in_oklch,var(--card),var(--foreground)_4.5%)] group-hover/empty:-translate-y-1 dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_7%)]',
        h,
      ),
      h.div(
        [
          h.Class(
            'absolute inset-x-0 bottom-0 flex h-14 items-center gap-2.5 rounded-block border border-(--edge-field) bg-card bg-clip-padding px-3 shadow-field dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_10%)]',
          ),
        ],
        [
          h.div([h.Class('size-7 shrink-0 rounded-full bg-foreground/12 dark:bg-foreground/15')]),
          h.div(
            [h.Class('flex flex-1 flex-col gap-1.5')],
            [
              h.div([h.Class('h-2.5 w-3/4 rounded-full bg-foreground/8 dark:bg-foreground/10')]),
              h.div([h.Class('h-2.5 w-1/2 rounded-full bg-foreground/8 dark:bg-foreground/10')]),
            ],
          ),
        ],
      ),
    ],
  );

export type MediaVariant = 'skeleton' | 'icon';

const MEDIA_VARIANT_CLASS: Record<MediaVariant, string> = {
  skeleton: 'mb-group w-full',
  icon: "mb-part size-control-lg rounded-control-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-icon-lg",
};

export type MediaConfig<Message> = PartConfig<Message> &
  Readonly<{
    variant?: MediaVariant | undefined;
  }>;

export const media = <Message>(
  { variant = 'skeleton', className, attributes = [], children = [] }: MediaConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.AriaHidden(true),
      h.DataAttribute('slot', 'empty-media'),
      h.DataAttribute('variant', variant),
      h.Class(cn('flex shrink-0 items-center justify-center', MEDIA_VARIANT_CLASS[variant], className)),
      ...attributes,
    ],
    variant === 'skeleton' ? [skeletonStack(h)] : children,
  );

export const title = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'empty-title'), h.Class(cn('text-heading text-balance', className)), ...attributes],
    children,
  );

export const description = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [
      h.DataAttribute('slot', 'empty-description'),
      h.Class(
        cn(
          'mt-tight max-w-sm text-body text-pretty text-muted-foreground',
          '[&>a]:font-medium [&>a]:text-foreground [&>a]:underline [&>a]:underline-offset-4',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const content = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'empty-content'),
      h.Class(cn('mt-group flex min-w-0 flex-wrap items-center justify-center gap-related', className)),
      ...attributes,
    ],
    children,
  );

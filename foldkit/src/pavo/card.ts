import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child, PartConfig } from './part.ts';

export type CardIntent = 'neutral' | 'destructive';

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    intent?: CardIntent | undefined;
  }>;

export const view = <Message>(
  { intent = 'neutral', className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.section(
    [
      h.DataAttribute('slot', 'card'),
      h.DataAttribute('intent', intent),
      h.Class(
        cn(
          'group/card rounded-card bg-(--card-shell) p-card-inset [--card-shell:var(--shell)] [--outer-inset:var(--spacing-card-inset)] [--outer-radius:var(--radius-card)]',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export type HeaderConfig<Message> = PartConfig<Message> &
  Readonly<{
    actions?: ReadonlyArray<Child> | undefined;
  }>;

export const header = <Message>(
  { actions, className, attributes = [], children = [] }: HeaderConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  actions === undefined
    ? h.div(
        [
          h.DataAttribute('slot', 'card-header'),
          h.Class(cn('px-[calc(var(--spacing-card)+1px)] py-group', className)),
          ...attributes,
        ],
        children,
      )
    : h.div(
        [
          h.DataAttribute('slot', 'card-header'),
          h.Class(
            cn('flex items-center justify-between gap-group px-[calc(var(--spacing-card)+1px)] py-group', className),
          ),
          ...attributes,
        ],
        [
          h.div([h.Class('min-w-0')], children),
          h.div(
            [h.Class('-my-[calc((var(--spacing-control-sm)-1.25rem)/2)] flex shrink-0 items-center gap-related')],
            actions,
          ),
        ],
      );

export type FooterConfig<Message> = PartConfig<Message> &
  Readonly<{
    isShown?: boolean | undefined;
  }>;

export const footer = <Message>(
  { isShown = true, className, attributes = [], children = [] }: FooterConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'card-footer'),
      ...(isShown ? [] : [h.DataAttribute('leaving', ''), h.Inert(true), h.AriaHidden(true)]),
      h.Class(
        cn(
          'grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-fold ease-spring-bounce',
          'data-leaving:opacity-0 data-leaving:duration-fold-sm data-leaving:ease-spring motion-safe:data-leaving:grid-rows-[0fr]',
          'motion-reduce:duration-fold-sm motion-reduce:ease-enter motion-reduce:transition-opacity motion-reduce:data-leaving:grid-rows-[0fr]',
        ),
      ),
    ],
    [
      h.div(
        [h.Class('min-h-0 overflow-hidden')],
        [
          h.div(
            [h.Class(cn('mb-group px-[calc(var(--spacing-card)+1px)] pt-group', className)), ...attributes],
            children,
          ),
        ],
      ),
    ],
  );

export const title = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.h2(
    [
      h.DataAttribute('slot', 'card-title'),
      h.Class(
        cn(
          'text-body leading-5 font-semibold text-balance group-data-[intent=destructive]/card:text-destructive',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const description = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [
      h.DataAttribute('slot', 'card-description'),
      h.Class(cn('max-w-prose overflow-hidden text-body leading-5 text-pretty text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );

export type ContentConfig<Message> = PartConfig<Message> &
  Readonly<{
    element?: 'div' | 'section' | 'form' | 'ul' | undefined;
  }>;

export const content = <Message>(
  { element = 'div', className, attributes = [], children = [] }: ContentConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h[element](
    [
      h.DataAttribute('slot', 'card-content'),
      h.DataAttribute('surface', 'card'),
      h.Class(
        cn(
          'rounded-[max(0px,calc(var(--outer-radius,var(--radius-card))-var(--outer-inset,0px)))] border border-(--edge) bg-card bg-clip-padding shadow-card',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

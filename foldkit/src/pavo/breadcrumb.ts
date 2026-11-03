import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { PartConfig } from './part.ts';

const DEFAULT_LABEL = 'Breadcrumb';

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    ariaLabel?: string | undefined;
  }>;

export const view = <Message>(
  { ariaLabel = DEFAULT_LABEL, className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.nav(
    [
      h.AriaLabel(ariaLabel),
      h.DataAttribute('slot', 'breadcrumb'),
      ...(className === undefined ? [] : [h.Class(className)]),
      ...attributes,
    ],
    children,
  );

export const list = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.ol(
    [
      h.DataAttribute('slot', 'breadcrumb-list'),
      h.Class(
        cn('flex flex-wrap items-center gap-control-gap text-body wrap-break-word text-muted-foreground', className),
      ),
      ...attributes,
    ],
    children,
  );

export const item = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.li(
    [
      h.DataAttribute('slot', 'breadcrumb-item'),
      h.Class(cn('inline-flex items-center gap-control-gap-sm', className)),
      ...attributes,
    ],
    children,
  );

export type LinkConfig<Message> = PartConfig<Message> &
  Readonly<{
    href: string;
  }>;

export const link = <Message>(
  { href, className, attributes = [], children = [] }: LinkConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.a(
    [
      h.Href(href),
      h.DataAttribute('slot', 'breadcrumb-link'),
      h.Class(cn('transition-colors hover:text-foreground', className)),
      ...attributes,
    ],
    children,
  );

export const page = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'breadcrumb-page'),
      h.AriaCurrent('page'),
      h.Class(cn('font-normal text-foreground', className)),
      ...attributes,
    ],
    children,
  );

export const separator = <Message>(
  { className, attributes = [], children }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.li(
    [
      h.DataAttribute('slot', 'breadcrumb-separator'),
      h.Role('presentation'),
      h.AriaHidden(true),
      h.Class(cn('[&>svg]:size-icon-sm', className)),
      ...attributes,
    ],
    children ?? [icon('chevron-right')],
  );

export const ellipsis = <Message>(
  { className, attributes = [] }: Omit<PartConfig<Message>, 'children'>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'breadcrumb-ellipsis'),
      h.Role('presentation'),
      h.AriaHidden(true),
      h.Class(cn('flex size-control-2xs items-center justify-center [&>svg]:size-icon', className)),
      ...attributes,
    ],
    [icon('dots')],
  );

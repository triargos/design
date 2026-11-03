import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';

export const view = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'stat'), h.Class(cn('flex min-w-0 flex-col gap-tight', className)), ...attributes],
    children,
  );

export const value = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [
      h.DataAttribute('slot', 'stat-value'),
      h.Class(cn('text-title text-foreground tabular-nums', className)),
      ...attributes,
    ],
    children,
  );

export const label = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [
      h.DataAttribute('slot', 'stat-label'),
      h.Class(cn('flex min-w-0 items-center gap-control-gap text-caption text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );

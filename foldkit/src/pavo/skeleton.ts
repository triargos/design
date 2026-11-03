import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    element?: 'div' | 'span' | undefined;
  }>;

export const view = <Message>(
  { element = 'div', className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h[element](
    [
      h.DataAttribute('slot', 'skeleton'),
      h.Class(cn('block animate-skeleton rounded-control-xs bg-skeleton', className)),
      ...attributes,
    ],
    children,
  );

import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';

export type Orientation = 'horizontal' | 'vertical';

export type ViewConfig<Message> = Omit<PartConfig<Message>, 'children'> &
  Readonly<{
    orientation?: Orientation | undefined;
  }>;

export const view = <Message>(
  { orientation = 'horizontal', className, attributes = [] }: ViewConfig<Message> = {},
  h: HtmlBuilder<Message>,
): Html =>
  h.div([
    h.Role('separator'),
    h.AriaOrientation(orientation),
    h.DataAttribute('orientation', orientation),
    h.DataAttribute('slot', 'separator'),
    h.Class(
      cn(
        'shrink-0 bg-border-subtle data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
        className,
      ),
    ),
    ...attributes,
  ]);

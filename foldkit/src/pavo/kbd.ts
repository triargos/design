import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';

export const view = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.kbd(
    [
      h.DataAttribute('slot', 'kbd'),
      h.Class(
        cn(
          "pointer-events-none inline-flex h-control-2xs w-fit min-w-control-2xs items-center justify-center gap-control-gap-sm rounded-control-xs bg-muted px-(--kbd-pad-x) font-sans text-caption font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-icon-xs",
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const group = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.kbd(
    [
      h.DataAttribute('slot', 'kbd-group'),
      h.Class(cn('inline-flex items-center gap-control-gap-sm', className)),
      ...attributes,
    ],
    children,
  );

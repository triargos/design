import { cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';
import * as Separator from './separator.ts';

export type Orientation = 'horizontal' | 'vertical';

const buttonGroupVariants = cva('flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10', {
  variants: {
    orientation: {
      horizontal:
        '[&>[data-slot]:has(~[data-slot])]:rounded-r-none [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0',
      vertical:
        'flex-col [&>[data-slot]:has(~[data-slot])]:rounded-b-none [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0',
    },
  },
});

export type ViewConfig<Message> = PartConfig<Message> & Readonly<{ orientation?: Orientation }>;

export const view = <Message>(
  { orientation = 'horizontal', className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Role('group'),
      h.DataAttribute('slot', 'button-group'),
      h.DataAttribute('orientation', orientation),
      h.Class(cn(buttonGroupVariants({ orientation }), className)),
      ...attributes,
    ],
    children,
  );

export type SeparatorConfig<Message> = Separator.ViewConfig<Message>;

export const separator = <Message>(
  { orientation = 'vertical', className, attributes = [] }: SeparatorConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  Separator.view(
    {
      orientation,
      className: cn(
        'relative self-stretch bg-border data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto',
        className,
      ),
      attributes: [...attributes, h.DataAttribute('slot', 'button-group-separator')],
    },
    h,
  );

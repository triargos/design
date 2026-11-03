import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    isAnimated?: boolean | undefined;
    element?: 'div' | 'ul' | 'ol' | 'section' | undefined;
  }>;

export const view = <Message>(
  { isAnimated = true, element = 'div', className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h[element](
    [
      h.DataAttribute('slot', 'fade-in'),
      h.Class(cn(isAnimated && 'animate-in duration-feedback ease-enter fade-in-0', className)),
      ...attributes,
    ],
    children,
  );

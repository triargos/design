import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import { dataColorStyle, type Intent } from './intent.ts';
import type { PartConfig } from './part.ts';

const INTENT_CLASS: Record<Intent, string> = {
  neutral: 'bg-faint-foreground',
  primary: 'bg-primary-solid',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

export type ViewConfig<Message> = Omit<PartConfig<Message>, 'children'> &
  Readonly<{
    intent?: Intent | undefined;
    color?: string | undefined;
  }>;

export const view = <Message>(
  { intent = 'neutral', color, className, attributes = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span([
    h.AriaHidden(true),
    h.DataAttribute('slot', 'status-dot'),
    h.Class(
      cn(
        'inline-flex size-2 shrink-0 rounded-full',
        color === undefined ? INTENT_CLASS[intent] : 'bg-(--data-color)',
        className,
      ),
    ),
    ...(color === undefined ? [] : [h.Style(dataColorStyle(color))]),
    ...attributes,
  ]);

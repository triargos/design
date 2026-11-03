import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import { type Intent, intentVariants } from './intent.ts';
import type { PartConfig } from './part.ts';

export type AlertIntent = Exclude<Intent, 'primary'>;

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    intent?: AlertIntent | undefined;
  }>;

export const view = <Message>(
  { intent = 'info', className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'alert'),
      h.DataAttribute('intent', intent),
      h.Class(
        cn(
          intentVariants({ intent, emphasis: 'subtle' }),
          'group/alert flex w-full items-center gap-part rounded-(--alert-radius) px-(--alert-pad-x) py-(--alert-pad-y) text-body data-[intent=neutral]:text-muted-foreground',
          '[--outer-inset:var(--alert-action-inset)] [--outer-radius:var(--alert-radius)]',
          'has-data-[slot=alert-action]:py-(--alert-action-inset) sm:has-data-[slot=alert-action]:pr-(--alert-action-inset)',
          'max-sm:has-data-[slot=alert-action]:flex-col max-sm:has-data-[slot=alert-action]:items-start max-sm:has-data-[slot=alert-action]:gap-(--alert-pad-y) max-sm:has-data-[slot=alert-action]:py-part',
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
  h.div([h.DataAttribute('slot', 'alert-content'), h.Class(cn('min-w-0 flex-1', className)), ...attributes], children);

export const action = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'alert-action'),
      h.Class(cn('shrink-0 sm:[&>:is(button,a)]:rounded-inner', className)),
      ...attributes,
    ],
    children,
  );

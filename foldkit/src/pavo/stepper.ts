import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { PartConfig } from './part.ts';
import * as Spinner from './spinner.ts';

export type Orientation = 'horizontal' | 'vertical';
export type StepState = 'active' | 'completed' | 'inactive';

export type ViewConfig<Message> = Omit<PartConfig<Message>, 'children'> &
  Readonly<{
    value: number;
    isLoading?: boolean | undefined;
    orientation?: Orientation | undefined;
    ariaLabel?: string | undefined;
    items: ReadonlyArray<PartConfig<Message>>;
  }>;

const stepState = (step: number, value: number): StepState => {
  if (step < value) {
    return 'completed';
  }
  return step === value ? 'active' : 'inactive';
};

const indicator = <Message>(step: number, isLoading: boolean, h: HtmlBuilder<Message>): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'stepper-indicator'),
      h.Class(
        cn(
          'relative flex size-(--stepper-indicator-size) shrink-0 items-center justify-center rounded-full text-caption font-medium tabular-nums transition-[background-color,color] duration-feedback',
          'bg-muted text-muted-foreground',
          'group-data-[state=active]/step:bg-primary-subtle group-data-[state=active]/step:text-primary-subtle-foreground',
          'group-data-[state=completed]/step:bg-primary-solid group-data-[state=completed]/step:text-primary-solid-foreground',
        ),
      ),
    ],
    [
      h.span(
        [
          h.Class(
            'transition-[opacity,scale] duration-feedback group-data-loading/step:scale-0 group-data-loading/step:opacity-0 group-data-[state=completed]/step:scale-0 group-data-[state=completed]/step:opacity-0',
          ),
        ],
        [String(step)],
      ),
      icon('check', {
        className:
          'absolute size-icon-xs scale-0 opacity-0 transition-[opacity,scale] duration-feedback group-data-[state=completed]/step:scale-100 group-data-[state=completed]/step:opacity-100',
      }),
      ...(isLoading ? [Spinner.view({ className: 'absolute size-icon-xs' })] : []),
    ],
  );

const connector = <Message>(h: HtmlBuilder<Message>): Html =>
  h.div([
    h.DataAttribute('slot', 'stepper-separator'),
    h.AriaHidden(true),
    h.Class(
      cn(
        'shrink-0 rounded-full bg-border transition-colors duration-feedback group-last/step:hidden group-data-[state=completed]/step:bg-primary-solid',
        'group-data-[orientation=horizontal]/stepper:mx-related group-data-[orientation=horizontal]/stepper:h-px group-data-[orientation=horizontal]/stepper:flex-1',
        'group-data-[orientation=vertical]/stepper:absolute group-data-[orientation=vertical]/stepper:top-[calc(var(--stepper-indicator-size)+4px)] group-data-[orientation=vertical]/stepper:bottom-1 group-data-[orientation=vertical]/stepper:left-[calc(var(--stepper-indicator-size)/2)] group-data-[orientation=vertical]/stepper:w-px group-data-[orientation=vertical]/stepper:-translate-x-1/2',
      ),
    ),
  ]);

const itemView = <Message>(
  step: number,
  value: number,
  isStepperLoading: boolean,
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html => {
  const state = stepState(step, value);
  const isLoading = isStepperLoading && state === 'active';
  return h.div(
    [
      h.Role('listitem'),
      ...(state === 'active' ? [h.AriaCurrent('step')] : []),
      h.DataAttribute('slot', 'stepper-item'),
      h.DataAttribute('state', state),
      ...(isLoading ? [h.DataAttribute('loading', '')] : []),
      h.Class(
        cn(
          'group/step relative flex',
          'group-data-[orientation=horizontal]/stepper:items-center group-data-[orientation=horizontal]/stepper:gap-related group-data-[orientation=horizontal]/stepper:not-last:flex-1',
          'group-data-[orientation=vertical]/stepper:items-start group-data-[orientation=vertical]/stepper:gap-part group-data-[orientation=vertical]/stepper:not-last:pb-group',
          className,
        ),
      ),
      ...attributes,
    ],
    [
      indicator(step, isLoading, h),
      h.div(
        [
          h.DataAttribute('slot', 'stepper-content'),
          h.Class('flex min-w-0 flex-col gap-tight group-data-[orientation=vertical]/stepper:flex-1'),
        ],
        children,
      ),
      connector(h),
    ],
  );
};

export const view = <Message>(
  {
    value,
    isLoading = false,
    orientation = 'horizontal',
    ariaLabel,
    items,
    className,
    attributes = [],
  }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Role('list'),
      ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
      h.DataAttribute('orientation', orientation),
      h.DataAttribute('slot', 'stepper'),
      h.Class(
        cn(
          'group/stepper flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center data-[orientation=vertical]:flex-col',
          className,
        ),
      ),
      ...attributes,
    ],
    items.map((item, index) => itemView(index + 1, value, isLoading, item, h)),
  );

export const title = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.h3(
    [
      h.DataAttribute('slot', 'stepper-title'),
      h.Class(
        cn('text-body font-medium text-foreground group-data-[state=inactive]/step:text-muted-foreground', className),
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
      h.DataAttribute('slot', 'stepper-description'),
      h.Class(cn('text-body text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );

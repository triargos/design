import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';

export type Orientation = 'horizontal' | 'vertical';

export type ViewConfig<Message> = Omit<PartConfig<Message>, 'children'> &
  Readonly<{
    value?: number | undefined;
    orientation?: Orientation | undefined;
    items: ReadonlyArray<PartConfig<Message>>;
  }>;

const itemView = <Message>(
  step: number,
  reachedStep: number,
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'timeline-item'),
      ...(step <= reachedStep ? [h.DataAttribute('completed', '')] : []),
      h.Class(
        cn(
          'group/timeline-item relative flex flex-1 flex-col group-data-[orientation=horizontal]/timeline:mt-[calc(var(--timeline-marker-size)+var(--spacing-group))] not-last:group-data-[orientation=horizontal]/timeline:pe-(--timeline-step-x) group-data-[orientation=vertical]/timeline:ms-[calc(var(--timeline-marker-size)+var(--spacing-group))] not-last:group-data-[orientation=vertical]/timeline:pb-(--timeline-step)',
          className,
        ),
      ),
      ...attributes,
    ],
    [
      h.div([
        h.DataAttribute('slot', 'timeline-separator'),
        h.AriaHidden(true),
        ...(step < reachedStep ? [h.DataAttribute('completed', '')] : []),
        h.Class(
          'absolute self-start bg-primary-subtle group-last/timeline-item:hidden data-completed:bg-primary-solid group-data-[orientation=horizontal]/timeline:-top-[calc(var(--timeline-marker-size)/2+var(--spacing-group))] group-data-[orientation=horizontal]/timeline:h-0.5 group-data-[orientation=horizontal]/timeline:w-[calc(100%-var(--timeline-marker-size)-4px)] group-data-[orientation=horizontal]/timeline:translate-x-[calc(var(--timeline-marker-size)+2px)] group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:-left-[calc(var(--timeline-marker-size)/2+var(--spacing-group))] group-data-[orientation=vertical]/timeline:h-[calc(100%-var(--timeline-marker-size)-4px)] group-data-[orientation=vertical]/timeline:w-0.5 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=vertical]/timeline:translate-y-[calc(var(--timeline-marker-size)+2px)]',
        ),
      ]),
      h.div([
        h.DataAttribute('slot', 'timeline-indicator'),
        h.AriaHidden(true),
        h.Class(
          'absolute size-(--timeline-marker-size) rounded-full border-2 border-primary-border group-data-completed/timeline-item:border-primary-solid group-data-[orientation=horizontal]/timeline:-top-[calc(var(--timeline-marker-size)/2+var(--spacing-group))] group-data-[orientation=horizontal]/timeline:left-0 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:top-0 group-data-[orientation=vertical]/timeline:-left-[calc(var(--timeline-marker-size)/2+var(--spacing-group))] group-data-[orientation=vertical]/timeline:-translate-x-1/2',
        ),
      ]),
      ...children,
    ],
  );

export const view = <Message>(
  { value = 1, orientation = 'vertical', items, className, attributes = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'timeline'),
      h.DataAttribute('orientation', orientation),
      h.Class(
        cn(
          'group/timeline flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
          className,
        ),
      ),
      ...attributes,
    ],
    items.map((item, index) => itemView(index + 1, value, item, h)),
  );

export type DateConfig<Message> = PartConfig<Message> &
  Readonly<{
    dateTime?: string | undefined;
  }>;

export const date = <Message>(
  { dateTime, className, attributes = [], children = [] }: DateConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.time(
    [
      h.DataAttribute('slot', 'timeline-date'),
      ...(dateTime === undefined ? [] : [h.Attribute('datetime', dateTime)]),
      h.Class(
        cn(
          'mb-tight block text-caption font-medium text-muted-foreground max-sm:group-data-[orientation=vertical]/timeline:h-(--text-caption--line-height)',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const title = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.h3(
    [
      h.DataAttribute('slot', 'timeline-title'),
      h.Class(cn('text-caption text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );

export const content = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'timeline-content'),
      h.Class(cn('mt-0.5 text-body text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );

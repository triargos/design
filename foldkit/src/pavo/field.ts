import { Array, Predicate } from 'effect';
import { cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartConfig } from './part.ts';
import * as Separator from './separator.ts';

export const fieldSet = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.fieldset(
    [
      h.DataAttribute('slot', 'field-set'),
      h.Class(cn('flex flex-col gap-group has-[>[data-slot=radio-group]]:gap-related', className)),
      ...attributes,
    ],
    children,
  );

export type LegendVariant = 'label' | 'legend';

export type LegendConfig<Message> = PartConfig<Message> & Readonly<{ variant?: LegendVariant }>;

export const legend = <Message>(
  { variant = 'label', className, attributes = [], children = [] }: LegendConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.legend(
    [
      h.DataAttribute('slot', 'field-legend'),
      h.DataAttribute('variant', variant),
      h.Class(
        cn(
          'data-[variant=label]:mb-part data-[variant=label]:text-label data-[variant=legend]:mb-group data-[variant=legend]:text-heading',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

const fieldGroupVariants = cva('group/field-group @container/field-group flex w-full flex-col gap-group', {
  variants: {
    columns: {
      1: '',
      2: 'grid md:grid-cols-2',
    },
  },
  defaultVariants: { columns: 1 },
});

export type GroupConfig<Message> = PartConfig<Message> & Readonly<{ columns?: 1 | 2 }>;

export const group = <Message>(
  { columns, className, attributes = [], children = [] }: GroupConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'field-group'), h.Class(cn(fieldGroupVariants({ columns }), className)), ...attributes],
    children,
  );

const fieldVariants = cva('group/field flex w-full gap-part data-[invalid=true]:text-destructive', {
  variants: {
    orientation: {
      vertical: ['flex-col gap-related [&>*]:w-full [&>.sr-only]:w-auto'],
      horizontal: [
        'flex-row items-center',
        '[&>[data-slot=field-label]]:flex-auto',
        'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-0.5',
        '[&>[data-slot=switch]]:self-center',
        '[&:not(:has(>[role=checkbox],>[role=radio],>[data-slot=textarea]))>[data-slot=field-content]]:self-center',
      ],
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export type Orientation = 'vertical' | 'horizontal';

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    orientation?: Orientation;
    isInvalid?: boolean;
    isDisabled?: boolean;
  }>;

export const view = <Message>(
  {
    orientation = 'vertical',
    isInvalid = false,
    isDisabled = false,
    className,
    attributes = [],
    children = [],
  }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Role('group'),
      h.DataAttribute('slot', 'field'),
      h.DataAttribute('orientation', orientation),
      ...(isInvalid ? [h.DataAttribute('invalid', 'true')] : []),
      ...(isDisabled ? [h.DataAttribute('disabled', 'true')] : []),
      h.Class(cn(fieldVariants({ orientation }), className)),
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
      h.DataAttribute('slot', 'field-content'),
      h.Class(cn('group/field-content flex flex-1 flex-col gap-tight leading-snug', className)),
      ...attributes,
    ],
    children,
  );

export type LabelConfig<Message> = PartConfig<Message> &
  Readonly<{
    forId?: string;
    isRequired?: boolean;
  }>;

export const label = <Message>(
  { forId, isRequired = false, className, attributes = [], children = [] }: LabelConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.label(
    [
      h.DataAttribute('slot', 'field-label'),
      ...(forId === undefined ? [] : [h.For(forId)]),
      h.Class(
        cn(
          'group/field-label peer/field-label flex w-fit items-center gap-related text-label select-none',
          'group-data-[disabled=true]/field:text-disabled-foreground peer-disabled:cursor-not-allowed peer-disabled:text-disabled-foreground',
          className,
        ),
      ),
      ...attributes,
    ],
    [
      ...children,
      ...(isRequired
        ? [
            h.span(
              [h.AriaHidden(true), h.Class('-ml-[calc(var(--spacing-related)/2)] text-caption text-muted-foreground')],
              ['*'],
            ),
          ]
        : []),
    ],
  );

export const title = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'field-label'),
      h.Class(
        cn(
          'flex w-fit items-center gap-related text-label group-data-[disabled=true]/field:text-disabled-foreground',
          className,
        ),
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
      h.DataAttribute('slot', 'field-description'),
      h.Class(
        cn(
          'text-body font-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance',
          'last:mt-0 nth-last-2:-mt-[calc(var(--spacing-related)-var(--spacing-tight))]',
          '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const separator = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'field-separator'),
      h.DataAttribute('content', String(Array.isReadonlyArrayNonEmpty(children))),
      h.Class(cn('relative -my-2 h-5 text-body', className)),
      ...attributes,
    ],
    [
      Separator.view({ className: 'absolute inset-0 top-1/2' }, h),
      ...(Array.isReadonlyArrayNonEmpty(children)
        ? [
            h.span(
              [
                h.DataAttribute('slot', 'field-separator-content'),
                h.Class('relative mx-auto block w-fit bg-surface px-related text-muted-foreground'),
              ],
              children,
            ),
          ]
        : []),
    ],
  );

export type ErrorConfig<Message> = PartConfig<Message> & Readonly<{ errors?: ReadonlyArray<string> }>;

export const error = <Message>(
  { errors = [], className, attributes = [], children = [] }: ErrorConfig<Message>,
  h: HtmlBuilder<Message>,
): Html => {
  const messages = Array.dedupe(Array.filter(errors, Predicate.isTruthy));

  const errorContent = (): ReadonlyArray<Html | string> => {
    if (Array.isReadonlyArrayNonEmpty(children)) {
      return children;
    } else if (messages.length === 1) {
      return messages;
    } else {
      return [
        h.ul(
          [h.Class('ml-4 flex list-disc flex-col gap-tight')],
          Array.map(messages, (message) => h.keyed('li')(message, [], [message])),
        ),
      ];
    }
  };

  if (Array.isReadonlyArrayEmpty(children) && Array.isReadonlyArrayEmpty(messages)) {
    return null;
  }

  return h.div(
    [
      h.Role('alert'),
      h.DataAttribute('slot', 'field-error'),
      h.Class(cn('text-body font-normal text-destructive', className)),
      ...attributes,
    ],
    errorContent(),
  );
};

import { Disclosure } from '@foldkit/ui';
import { Array } from 'effect';
import { cva } from 'class-variance-authority';
import { type Html, type HtmlBuilder, inertHtml as ih } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child, PartAttribute } from './part.ts';

export type AccordionVariant = 'default' | 'flush';

const accordionItemVariants = cva('border-b border-border-subtle last:border-b-0', {
  variants: { variant: { default: 'pb-[calc(var(--accordion-pad)/2)]', flush: '' } },
});

const accordionTriggerVariants = cva(
  'group/accordion-trigger hit-area relative flex w-full flex-1 items-start gap-row-gap text-left text-body font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/24 aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
  {
    variants: {
      variant: {
        default: 'rounded-area px-(--accordion-pad) pt-(--accordion-pad) pb-[calc(var(--accordion-pad)/2)]',
        flush:
          'items-center rounded-none px-card py-row-pad-y transition-colors duration-feedback hover:bg-row-hover focus-visible:ring-inset in-data-[slot=sheet-body]:px-modal',
      },
    },
  },
);

const accordionContentVariants = cva(
  '[&_a:not([data-slot=button])]:underline [&_a:not([data-slot=button])]:underline-offset-3 [&_a:not([data-slot=button])]:hover:text-foreground [&_p:not(:last-child)]:mb-group',
  {
    variants: {
      variant: {
        default:
          'ps-[calc(var(--accordion-pad)+var(--spacing-icon-lg)+var(--spacing-row-gap))] pe-(--accordion-content-pad-end) pb-[calc(var(--accordion-pad)/2)]',
        flush:
          'ps-[calc(var(--spacing-card)+var(--spacing-icon-lg)+var(--spacing-row-gap))] pe-card pb-(--accordion-flush-content-pad-bottom) in-data-[slot=sheet-body]:ps-[calc(var(--spacing-modal)+var(--spacing-icon-lg)+var(--spacing-row-gap))] in-data-[slot=sheet-body]:pe-modal',
      },
    },
  },
);

const INDICATOR_STROKE_WIDTH = String(5 / 3);

const indicator = (): Html =>
  ih.svg(
    [
      ih.AriaHidden(true),
      ih.ViewBox('0 0 16 16'),
      ih.Fill('none'),
      ih.Stroke('currentColor'),
      ih.StrokeLinecap('round'),
      ih.Attribute('stroke-width', INDICATOR_STROKE_WIDTH),
      ih.Class('size-icon-xs'),
    ],
    [
      ih.line([ih.Attribute('x1', '3'), ih.Attribute('x2', '13'), ih.Attribute('y1', '8'), ih.Attribute('y2', '8')]),
      ih.line([
        ih.Attribute('x1', '8'),
        ih.Attribute('x2', '8'),
        ih.Attribute('y1', '3'),
        ih.Attribute('y2', '13'),
        ih.Class(
          'origin-center transition-transform duration-move ease-move group-data-open/accordion-trigger:scale-y-0 motion-reduce:transition-none',
        ),
      ]),
    ],
  );

export type Item = Readonly<{
  value: string;
  trigger: ReadonlyArray<Child>;
  content: ReadonlyArray<Child>;
  contentClassName?: string | undefined;
  isDisabled?: boolean | undefined;
}>;

export type ViewConfig<Message> = Readonly<{
  id: string;
  items: ReadonlyArray<Item>;
  openValues: ReadonlyArray<string>;
  onOpenValuesChange: (openValues: ReadonlyArray<string>) => Message;
  isMultiple?: boolean | undefined;
  variant?: AccordionVariant | undefined;
  className?: string | undefined;
  attributes?: ReadonlyArray<PartAttribute<Message>> | undefined;
}>;

export const toggledValues = (
  openValues: ReadonlyArray<string>,
  value: string,
  isOpen: boolean,
  isMultiple: boolean,
): ReadonlyArray<string> => {
  const withoutValue = Array.filter(openValues, (openValue) => openValue !== value);
  if (!isOpen) {
    return withoutValue;
  } else if (isMultiple) {
    return Array.append(withoutValue, value);
  } else {
    return [value];
  }
};

const itemView = <Message>(
  config: ViewConfig<Message>,
  variant: AccordionVariant,
  item: Item,
  h: HtmlBuilder<Message>,
): Html => {
  const { id, openValues, onOpenValuesChange, isMultiple = false } = config;
  const isOpen = Array.contains(openValues, item.value);

  return Disclosure.view(
    {
      id: `${id}-${item.value}`,
      isOpen,
      isDisabled: item.isDisabled ?? false,
      onToggle: (nextIsOpen) => onOpenValuesChange(toggledValues(openValues, item.value, nextIsOpen, isMultiple)),
      toView: ({ button, panel }) =>
        h.keyed('div')(
          item.value,
          [
            h.DataAttribute('slot', 'accordion-item'),
            ...(isOpen ? [h.DataAttribute('open', '')] : []),
            h.Class(accordionItemVariants({ variant })),
          ],
          [
            h.h3(
              [h.Class('flex min-w-0')],
              [
                h.button(
                  [
                    ...button,
                    h.DataAttribute('slot', 'accordion-trigger'),
                    h.Class(accordionTriggerVariants({ variant })),
                  ],
                  [
                    h.span(
                      [
                        h.DataAttribute('slot', 'accordion-trigger-icon'),
                        h.Class('flex h-[1lh] w-icon-lg shrink-0 items-center justify-center text-muted-foreground'),
                      ],
                      [indicator()],
                    ),
                    ...item.trigger,
                  ],
                ),
              ],
            ),
            h.div(
              [
                ...panel,
                h.DataAttribute('slot', 'accordion-content'),
                h.Class(
                  'grid grid-rows-[0fr] overflow-hidden text-body transition-[grid-template-rows] duration-move ease-move data-open:grid-rows-[1fr] motion-reduce:transition-none',
                ),
              ],
              [
                h.div(
                  [h.Class('min-h-0 overflow-hidden'), ...(isOpen ? [] : [h.Inert(true), h.AriaHidden(true)])],
                  [h.div([h.Class(cn(accordionContentVariants({ variant }), item.contentClassName))], item.content)],
                ),
              ],
            ),
          ],
        ),
    },
    h,
  );
};

export const view = <Message>(config: ViewConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const { items, variant = 'default', className, attributes = [] } = config;

  return h.div(
    [
      h.DataAttribute('slot', 'accordion'),
      h.DataAttribute('variant', variant),
      h.Class(
        cn(
          'flex w-full flex-col',
          variant === 'flush' && 'in-data-[slot=sheet-body]:-mx-modal in-data-[slot=sheet-body]:w-auto',
          className,
        ),
      ),
      ...attributes,
    ],
    Array.map(items, (item) => itemView(config, variant, item, h)),
  );
};

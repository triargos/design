import { Checkbox as CheckboxPrimitive } from '@foldkit/ui';
import { cva } from 'class-variance-authority';
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import { icon } from './icon.ts';
import * as IconSwap from './icon-swap.ts';
import type { PartAttribute } from './part.ts';

export const selectionControlVariants = cva(
  [
    'peer relative flex size-(--checkbox-size) shrink-0 items-center justify-center inset-ring inset-ring-neutral-border outline-none',
    'transition-[background-color,box-shadow,color,scale] duration-feedback',
    'after:absolute after:-inset-x-3 after:-inset-y-2',
    'not-data-disabled:hover:bg-neutral-subtle not-data-disabled:active:scale-[0.96] motion-reduce:not-data-disabled:active:scale-100',
    'focus-visible:ring-3 focus-visible:ring-ring/24 focus-visible:inset-ring-ring',
    'aria-invalid:inset-ring-destructive-border focus-visible:aria-invalid:ring-destructive/16 dark:focus-visible:aria-invalid:ring-destructive/24',
    'data-checked:bg-primary-solid data-checked:text-primary-solid-foreground data-checked:inset-ring-transparent',
    'not-data-disabled:data-checked:hover:bg-[color-mix(in_oklch,var(--primary-solid),black_8%)]',
    'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:inset-ring-transparent',
    'data-checked:data-disabled:bg-disabled data-checked:data-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      shape: {
        square: [
          'rounded-checkbox',
          'data-indeterminate:bg-primary-solid data-indeterminate:text-primary-solid-foreground data-indeterminate:inset-ring-transparent',
          'not-data-disabled:data-indeterminate:hover:bg-[color-mix(in_oklch,var(--primary-solid),black_8%)]',
          'data-indeterminate:data-disabled:bg-disabled data-indeterminate:data-disabled:text-disabled-foreground',
        ],
        round: 'rounded-full inset-ring-foreground/24',
      },
    },
    defaultVariants: { shape: 'square' },
  },
);

export const { labelId, descriptionId } = CheckboxPrimitive;

export type RenderInfo<Message> = Readonly<{
  checkbox: Html;
  label: ReadonlyArray<Attribute<Message>>;
  description: ReadonlyArray<Attribute<Message>>;
}>;

export type ViewConfig<Message> = Readonly<{
  id: string;
  isChecked: boolean;
  onToggle: (isChecked: boolean) => Message;
  toView?: (render: RenderInfo<Message>) => Html;
  isIndeterminate?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  hasDescription?: boolean;
  name?: string;
  value?: string;
  ariaLabel?: string;
  className?: string;
  attributes?: ReadonlyArray<PartAttribute<Message>>;
}>;

const mark = (isChecked: boolean, isIndeterminate: boolean): ReadonlyArray<Html> => [
  IconSwap.view({ isShown: isIndeterminate, children: [icon('minus')] }),
  IconSwap.drawnCheck({ isShown: isChecked && !isIndeterminate }),
];

export const view = <Message>(config: ViewConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const {
    toView = ({ checkbox }) => checkbox,
    isInvalid = false,
    ariaLabel,
    className,
    attributes = [],
    ...primitiveConfig
  } = config;
  const { isChecked, isIndeterminate = false, name } = primitiveConfig;

  return CheckboxPrimitive.view(
    {
      ...primitiveConfig,
      toView: (render) => {
        const checkbox = h.button(
          [
            ...render.checkbox,
            h.Id(primitiveConfig.id),
            h.DataAttribute('slot', 'checkbox'),
            ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
            ...(isInvalid ? [h.AriaInvalid(true)] : []),
            h.Class(cn(selectionControlVariants({ shape: 'square' }), className)),
            ...attributes,
          ],
          [
            h.span(
              [
                h.DataAttribute('slot', 'checkbox-indicator'),
                h.Class('pointer-events-none grid text-current *:col-start-1 *:row-start-1 [&_svg]:size-icon-xs'),
              ],
              mark(isChecked, isIndeterminate),
            ),
            ...(name === undefined ? [] : [h.input(render.hiddenInput)]),
          ],
        );
        return toView({ checkbox, label: render.label, description: render.description });
      },
    },
    h,
  );
};

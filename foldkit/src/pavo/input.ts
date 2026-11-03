import { Input as InputPrimitive } from '@foldkit/ui';
import { cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartAttribute } from './part.ts';

export const inputSurfaceVariants = cva(
  [
    'hit-area relative rounded-(--field-radius) border border-(--edge-field) bg-surface bg-clip-padding shadow-field [--field-radius:var(--radius-control)] [--outer-radius:var(--field-radius)] dark:bg-[color-mix(in_oklab,var(--edge-field)_32%,transparent)]',
    'before:pointer-events-none before:absolute before:inset-0 before:rounded-[max(0px,calc(var(--field-radius)-1px))] before:shadow-field-edge',
    'transition-[background-color,border-color,box-shadow] duration-feedback outline-none',
  ],
  {
    variants: {
      scope: {
        self: [
          'focus-visible:border-ring focus-visible:shadow-none focus-visible:ring-3 focus-visible:ring-ring/24',
          'aria-expanded:border-ring aria-expanded:shadow-none aria-expanded:ring-3 aria-expanded:ring-ring/24',
          'aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/16 dark:focus-visible:aria-invalid:ring-destructive/24',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-64 disabled:shadow-field-flat disabled:before:shadow-none',
          '[&:is([readonly],[data-readonly])]:text-muted-foreground [&:is([readonly],[data-readonly])]:shadow-field-flat',
          '[&:is([readonly],[data-readonly])]:focus-visible:border-(--edge-field) [&:is([readonly],[data-readonly])]:focus-visible:shadow-field-flat [&:is([readonly],[data-readonly])]:focus-visible:ring-0',
        ],
        group: [
          'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/24',
          'has-[[data-slot=input-group-control][aria-expanded=true]]:border-ring has-[[data-slot=input-group-control][aria-expanded=true]]:shadow-none has-[[data-slot=input-group-control][aria-expanded=true]]:ring-3 has-[[data-slot=input-group-control][aria-expanded=true]]:ring-ring/24',
          'has-[[data-slot][aria-invalid=true]]:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'has-[[data-slot][aria-invalid=true]:focus-visible]:border-destructive/64 has-[[data-slot][aria-invalid=true]:focus-visible]:ring-destructive/16 dark:has-[[data-slot][aria-invalid=true]:focus-visible]:ring-destructive/24',
          'has-[[data-slot=input-group-control]:disabled]:opacity-64 has-[[data-slot=input-group-control]:disabled]:shadow-field-flat has-[[data-slot=input-group-control]:disabled]:before:shadow-none',
          'has-[[data-slot=input-group-control]:is([readonly],[data-readonly])]:text-muted-foreground has-[[data-slot=input-group-control]:is([readonly],[data-readonly])]:shadow-field-flat',
          'has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:border-(--edge-field) has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:shadow-field-flat has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:ring-0',
        ],
        within: [
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/24 focus-within:shadow-none',
          'has-aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'focus-within:has-aria-invalid:border-destructive/64 focus-within:has-aria-invalid:ring-destructive/16 dark:focus-within:has-aria-invalid:ring-destructive/24',
          'aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'focus-within:aria-invalid:border-destructive/64 focus-within:aria-invalid:ring-destructive/16 dark:focus-within:aria-invalid:ring-destructive/24',
          'has-[[readonly],[data-readonly]]:text-muted-foreground has-[[readonly],[data-readonly]]:shadow-field-flat',
          'has-[[readonly],[data-readonly]]:focus-within:border-(--edge-field) has-[[readonly],[data-readonly]]:focus-within:shadow-field-flat has-[[readonly],[data-readonly]]:focus-within:ring-0',
          'has-disabled:opacity-64 has-disabled:shadow-field-flat has-disabled:before:shadow-none',
        ],
      },
    },
    defaultVariants: {
      scope: 'self',
    },
  },
);

export const { descriptionId } = InputPrimitive;

export type ControlConfig<Message> = Readonly<{
  id: string;
  value?: string;
  defaultValue?: string;
  onInput?: (value: string) => Message;
  type?: string;
  name?: string;
  placeholder?: string;
  ariaLabel?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isAutofocus?: boolean;
  hasDescription?: boolean;
  attributes?: ReadonlyArray<PartAttribute<Message>>;
}>;

export const control = <Message>(
  config: ControlConfig<Message>,
  controlAttributes: ReadonlyArray<PartAttribute<Message>>,
  h: HtmlBuilder<Message>,
): Html => {
  const { defaultValue, ariaLabel, isRequired = false, attributes = [], ...primitiveConfig } = config;
  return InputPrimitive.view(
    {
      ...primitiveConfig,
      toView: (render) =>
        h.input([
          ...render.input,
          ...(defaultValue === undefined ? [] : [h.Attribute('value', defaultValue)]),
          ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
          ...(isRequired ? [h.Required(true)] : []),
          ...controlAttributes,
          ...attributes,
        ]),
    },
    h,
  );
};

export type ViewConfig<Message> = ControlConfig<Message> & Readonly<{ className?: string }>;

export const view = <Message>(config: ViewConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const { className, ...controlConfig } = config;
  return h.span(
    [
      h.DataAttribute('slot', 'input'),
      h.Class(
        cn(
          inputSurfaceVariants({ scope: 'within' }),
          'flex h-control w-full min-w-0 cursor-text items-center px-[calc(var(--spacing-field-pad)-1px)] text-control max-md:text-[1rem]',
          'has-[[type=file]]:cursor-pointer has-[[type=file]]:pl-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-2px)]',
          className,
        ),
      ),
    ],
    [
      control(
        controlConfig,
        [
          h.DataAttribute('slot', 'input-control'),
          h.Class(
            cn(
              'h-full w-full min-w-0 flex-1 bg-transparent p-0 outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed',
              '-mx-[calc(var(--spacing-field-pad)-1px)] px-[calc(var(--spacing-field-pad)-1px)]',
              '[&[type=file]]:mx-0 [&[type=file]]:h-auto [&[type=file]]:p-px [&[type=file]]:cursor-pointer [&[type=file]]:text-muted-foreground [&[type=file]]:[--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)]',
              'file:me-related file:h-control-xs file:cursor-pointer file:rounded-inner file:border-0 file:bg-card file:px-(--field-chip-pad-x) file:text-caption file:font-medium file:text-foreground file:shadow-raised file:transition-shadow file:duration-feedback hover:file:shadow-raised-hover dark:file:bg-foreground/10',
            ),
          ),
        ],
        h,
      ),
    ],
  );
};

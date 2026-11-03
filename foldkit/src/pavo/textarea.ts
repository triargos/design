import { Textarea as TextareaPrimitive } from '@foldkit/ui';
import type { ChildAttribute, Html, HtmlBuilder, TextareaAttribute } from 'foldkit/html';

import { cn } from './cn.ts';
import { inputSurfaceVariants } from './input.ts';

export const { descriptionId } = TextareaPrimitive;

export type ControlAttribute<Message> = TextareaAttribute<Message> | ChildAttribute;

export type ControlConfig<Message> = Readonly<{
  id: string;
  value?: string;
  defaultValue?: string;
  onInput?: (value: string) => Message;
  name?: string;
  rows?: number;
  placeholder?: string;
  ariaLabel?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isAutofocus?: boolean;
  hasDescription?: boolean;
  attributes?: ReadonlyArray<ControlAttribute<Message>>;
}>;

export const control = <Message>(
  config: ControlConfig<Message>,
  controlAttributes: ReadonlyArray<ControlAttribute<Message>>,
  h: HtmlBuilder<Message>,
): Html => {
  const { defaultValue, ariaLabel, isRequired = false, attributes = [], ...primitiveConfig } = config;
  return TextareaPrimitive.view(
    {
      ...primitiveConfig,
      toView: (render) =>
        h.textarea([
          ...render.textarea,
          ...(defaultValue === undefined ? [] : [h.Value(defaultValue)]),
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
  return control(
    controlConfig,
    [
      h.DataAttribute('slot', 'textarea'),
      h.Class(
        cn(
          inputSurfaceVariants(),
          '[--field-radius:var(--radius-area)]',
          'flex min-h-(--textarea-min-height) w-full px-[calc(var(--spacing-field-pad)-1px)] py-field-pad-y text-control outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed max-md:text-[1rem]',
          className,
        ),
      ),
    ],
    h,
  );
};

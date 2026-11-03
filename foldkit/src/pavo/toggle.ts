import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import type { Child, PartAttribute } from './part.ts';

export type ViewConfig<Message> = Readonly<{
  isPressed: boolean;
  onPressedChange: (isPressed: boolean) => Message;
  size?: Button.ButtonSize;
  isDisabled?: boolean;
  ariaLabel?: string;
  className?: string;
  attributes?: ReadonlyArray<PartAttribute<Message>>;
  children: ReadonlyArray<Child>;
}>;

export const view = <Message>(config: ViewConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const {
    isPressed,
    onPressedChange,
    size = 'default',
    isDisabled = false,
    className,
    attributes = [],
    ...rest
  } = config;
  return Button.view(
    {
      ...rest,
      emphasis: 'ghost',
      size,
      isDisabled,
      onClick: onPressedChange(!isPressed),
      className: cn(
        'data-pressed:bg-[color-mix(in_oklch,var(--intent-subtle),var(--intent)_8%)] data-pressed:hover:bg-[color-mix(in_oklch,var(--intent-subtle),var(--intent)_8%)]',
        className,
      ),
      attributes: [
        h.AriaPressed(String(isPressed)),
        ...(isPressed ? [h.DataAttribute('pressed', '')] : []),
        ...attributes,
        h.DataAttribute('slot', 'toggle'),
      ],
    },
    h,
  );
};

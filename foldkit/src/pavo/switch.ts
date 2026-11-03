import { Switch as SwitchPrimitive } from '@foldkit/ui';
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { PartAttribute } from './part.ts';

export const { labelId, descriptionId } = SwitchPrimitive;

export type SwitchSize = 'sm' | 'default';

export type RenderInfo<Message> = Readonly<{
  switch: Html;
  label: ReadonlyArray<Attribute<Message>>;
  description: ReadonlyArray<Attribute<Message>>;
}>;

export type ViewConfig<Message> = Readonly<{
  id: string;
  isChecked: boolean;
  onToggle: (isChecked: boolean) => Message;
  toView?: (render: RenderInfo<Message>) => Html;
  size?: SwitchSize;
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

export const view = <Message>(config: ViewConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const {
    toView = (render) => render.switch,
    size = 'default',
    isInvalid = false,
    ariaLabel,
    className,
    attributes = [],
    ...primitiveConfig
  } = config;
  const { isChecked, name } = primitiveConfig;

  return SwitchPrimitive.view(
    {
      ...primitiveConfig,
      toView: (render) => {
        const switchElement = h.button(
          [
            ...render.button,
            h.Id(primitiveConfig.id),
            h.DataAttribute('slot', 'switch'),
            h.DataAttribute('size', size),
            ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
            ...(isInvalid ? [h.AriaInvalid(true)] : []),
            h.Class(
              cn(
                'peer group/switch relative inline-flex shrink-0 items-center rounded-track bg-foreground/14 p-(--switch-inset) outline-none',
                '[--switch-stretch:0px] data-[size=default]:[--thumb-size:var(--switch-thumb)] data-[size=sm]:[--thumb-size:var(--switch-thumb-sm)]',
                'data-[size=default]:[--track:var(--switch-width)] data-[size=sm]:[--track:var(--switch-width-sm)]',
                'h-[calc(var(--thumb-size)+var(--switch-inset)*2)] w-(--track)',
                'transition-[background-color,box-shadow] duration-feedback',
                'after:absolute after:-inset-x-3 after:-inset-y-2',
                'not-data-disabled:hover:bg-foreground/20 not-data-disabled:active:[--switch-stretch:--spacing(1)]',
                'data-checked:bg-primary-solid not-data-disabled:data-checked:hover:bg-[color-mix(in_oklch,var(--primary-solid),black_8%)]',
                'focus-visible:ring-3 focus-visible:inset-ring focus-visible:ring-ring/24 focus-visible:inset-ring-ring',
                'group-has-[:focus-visible]/field-label:ring-0',
                'aria-invalid:inset-ring aria-invalid:inset-ring-destructive-border focus-visible:aria-invalid:ring-destructive/16',
                'data-disabled:cursor-not-allowed data-disabled:bg-disabled',
                className,
              ),
            ),
            ...attributes,
          ],
          [
            h.span([
              h.DataAttribute('slot', 'switch-thumb'),
              ...(isChecked ? [h.DataAttribute('checked', '')] : []),
              h.Class(
                cn(
                  'pointer-events-none block h-(--thumb-size) w-[calc(var(--thumb-size)+var(--switch-stretch))] rounded-track bg-thumb',
                  'transition-[width,translate,background-color] duration-move ease-move motion-reduce:transition-none',
                  'data-checked:translate-x-[calc(var(--track)-var(--switch-inset)*2-var(--thumb-size)-var(--switch-stretch))] data-checked:bg-primary-solid-foreground',
                  'group-data-disabled/switch:bg-disabled-foreground group-data-disabled/switch:data-checked:bg-disabled-foreground',
                ),
              ),
            ]),
            ...(name === undefined ? [] : [h.input(render.hiddenInput)]),
          ],
        );
        return toView({ switch: switchElement, label: render.label, description: render.description });
      },
    },
    h,
  );
};

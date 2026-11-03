import { cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import * as Input from './input.ts';
import type { PartConfig } from './part.ts';
import * as Textarea from './textarea.ts';

export type ViewConfig<Message> = PartConfig<Message> & Readonly<{ isDisabled?: boolean }>;

export const view = <Message>(
  { isDisabled = false, className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'input-group'),
      h.Role('group'),
      ...(isDisabled ? [h.DataAttribute('disabled', 'true')] : []),
      h.Class(
        cn(
          Input.inputSurfaceVariants({ scope: 'group' }),
          'h-control',
          'has-[>textarea]:[--field-radius:var(--radius-area)] has-[>[data-align=block-end]]:[--field-radius:var(--radius-area)] has-[>[data-align=block-start]]:[--field-radius:var(--radius-area)]',
          'in-data-[slot=combobox-content]:focus-within:bg-transparent in-data-[slot=combobox-content]:focus-within:ring-1 in-data-[slot=combobox-content]:focus-within:ring-border/50',
          'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:*:data-[slot=input-group-input]:pt-field-pad has-[>[data-align=block-start]]:*:data-[slot=input-group-input]:pb-field-pad has-[>[data-align=inline-end]]:*:data-[slot=input-group-input]:pr-control-gap has-[>[data-align=inline-start]]:*:data-[slot=input-group-input]:pl-control-gap',
          'group/input-group relative flex w-full min-w-0 items-center has-[>textarea]:h-auto',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export type AddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end';

const addonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-related py-[calc((var(--spacing-control)-var(--spacing-control-xs))/2)] text-body font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:text-disabled-foreground [&>kbd]:rounded-control-xs [&>svg:not([class*='size-'])]:size-icon",
  {
    variants: {
      align: {
        'inline-start':
          'order-first pl-[calc(var(--spacing-field-pad)-1px)] has-[>button]:pl-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] has-[>kbd]:pl-[calc((var(--spacing-control)-var(--spacing-control-2xs))/2-1px)]',
        'inline-end':
          'order-last pr-[calc(var(--spacing-field-pad)-1px)] has-[>button]:pr-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] has-[>kbd]:pr-[calc((var(--spacing-control)-var(--spacing-control-2xs))/2-1px)]',
        'block-start':
          'order-first w-full justify-start px-[calc(var(--spacing-field-pad)-1px)] pt-field-pad-y [.border-b]:pb-field-pad-y',
        'block-end':
          'order-last w-full justify-start px-[calc(var(--spacing-field-pad)-1px)] pb-field-pad-y [.border-t]:pt-field-pad-y',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

export type AddonConfig<Message> = PartConfig<Message> & Readonly<{ align?: AddonAlign }>;

export const addon = <Message>(
  { align = 'inline-start', className, attributes = [], children = [] }: AddonConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Role('group'),
      h.DataAttribute('slot', 'input-group-addon'),
      h.DataAttribute('align', align),
      h.Class(cn(addonVariants({ align }), className)),
      ...attributes,
    ],
    children,
  );

export type ButtonSize = 'xs' | 'action' | 'icon-xs';

export const buttonVariants = cva(
  'flex items-center gap-related text-body text-muted-foreground shadow-none aria-expanded:bg-transparent aria-expanded:text-foreground',
  {
    variants: {
      size: {
        xs: "h-control-xs gap-control-gap-sm rounded-inner px-(--field-button-pad-x) [--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)] [&>svg:not([class*='size-'])]:size-icon-sm",
        action:
          'h-control-xs rounded-inner px-(--field-chip-pad-x) text-caption font-medium text-foreground shadow-raised [--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)]',
        'icon-xs':
          'size-control-xs rounded-inner p-0 [--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)] has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
);

export type ButtonConfig<Message> = Omit<Button.ViewConfig<Message>, 'size'> & Readonly<{ size?: ButtonSize }>;

export const button = <Message>(config: ButtonConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const { size = 'xs', className, attributes = [], ...buttonConfig } = config;
  const isAction = size === 'action';
  return Button.view(
    {
      type: isAction ? 'submit' : 'button',
      emphasis: isAction ? 'raised' : 'ghost',
      ...buttonConfig,
      className: cn(buttonVariants({ size }), className),
      attributes: [...attributes, h.DataAttribute('size', size)],
    },
    h,
  );
};

export const text = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'input-group-text'),
      h.Class(
        cn(
          "flex items-center gap-related text-body text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-icon",
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export type InputConfig<Message> = Input.ControlConfig<Message> & Readonly<{ className?: string }>;

export const input = <Message>(config: InputConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const { className, ...controlConfig } = config;
  return h.span(
    [
      h.DataAttribute('slot', 'input-group-input'),
      h.Class(
        cn(
          'flex h-full min-w-0 flex-1 cursor-text items-center px-[calc(var(--spacing-field-pad)-1px)] text-control max-md:text-[1rem]',
          className,
        ),
      ),
    ],
    [
      Input.control(
        controlConfig,
        [
          h.DataAttribute('slot', 'input-group-control'),
          h.Class(
            'h-full w-full min-w-0 flex-1 bg-transparent p-0 outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed',
          ),
        ],
        h,
      ),
    ],
  );
};

export type TextareaConfig<Message> = Textarea.ControlConfig<Message> & Readonly<{ className?: string }>;

export const textarea = <Message>(config: TextareaConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const { className, ...controlConfig } = config;
  return Textarea.control(
    controlConfig,
    [
      h.DataAttribute('slot', 'input-group-control'),
      h.Class(
        cn(
          'flex min-h-(--textarea-min-height) w-full resize-none bg-transparent px-[calc(var(--spacing-field-pad)-1px)] py-field-pad-y text-control outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed max-md:text-[1rem]',
          className,
        ),
      ),
    ],
    h,
  );
};

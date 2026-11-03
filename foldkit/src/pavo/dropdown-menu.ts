import { Menu as MenuPrimitive } from '@foldkit/ui';
import { cva } from 'class-variance-authority';
import { type Attribute, type Html, type HtmlBuilder, childAttributes } from 'foldkit/html';

import { type ButtonSize, buttonVariants } from './button.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { Emphasis, Intent } from './intent.ts';
import type { Child, PartConfig } from './part.ts';

export const { Model, Message, OutMessage, init, buttonId } = MenuPrimitive;
export type Model = MenuPrimitive.Model;
export type Message = MenuPrimitive.Message;
export type OutMessage<Item extends string = string> = MenuPrimitive.OutMessage<Item>;
export type AnchorConfig = MenuPrimitive.AnchorConfig;

export const isOpen = (model: Model): boolean => model.isOpen;

export type MenuSlot = 'dropdown-menu' | 'context-menu';

export const itemVariants = cva(
  "relative flex cursor-default items-center gap-row-gap rounded-inner py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-active:bg-highlight data-active:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon",
  {
    variants: {
      intent: {
        neutral: '',
        destructive:
          'text-destructive data-active:bg-destructive-subtle data-active:text-destructive [&_svg]:text-destructive!',
      },
      indicator: {
        false: 'px-menu-item-pad',
        true: 'pr-menu-item-pad pl-[calc(var(--spacing-menu-item-pad)+var(--spacing-icon)+var(--spacing-row-gap))]',
      },
    },
    compoundVariants: [
      { intent: 'neutral', indicator: false, className: "[&_svg:not([class*='text-'])]:text-muted-foreground" },
    ],
    defaultVariants: { intent: 'neutral', indicator: false },
  },
);

export const popupClassName = cn(
  'z-50 min-w-32 overflow-x-hidden overflow-y-auto rounded-popup bg-popover p-popup-inset text-popover-foreground shadow-popup outline-none [--outer-inset:var(--spacing-popup-inset)] [--outer-radius:var(--radius-popup)]',
  'data-[placement=bottom]:origin-top data-[placement=left]:origin-right data-[placement=right]:origin-left data-[placement=top]:origin-bottom',
  'transition-[opacity,scale,translate] duration-enter ease-enter data-closed:scale-95 data-closed:opacity-0',
  'data-enter:data-closed:data-[placement=bottom]:-translate-y-2 data-enter:data-closed:data-[placement=left]:translate-x-2 data-enter:data-closed:data-[placement=right]:-translate-x-2 data-enter:data-closed:data-[placement=top]:translate-y-2',
  'motion-reduce:data-closed:scale-100 motion-reduce:data-closed:translate-x-0 motion-reduce:data-closed:translate-y-0',
);

const labelClassName =
  'px-menu-item-pad pt-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] pb-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/4)] text-caption font-medium text-muted-foreground';

const separatorClassName = '-mx-popup-inset my-popup-inset h-px bg-border';

export type ItemKind = 'Item' | 'Checkbox' | 'Radio';

export type ItemConfig = Readonly<{
  kind?: ItemKind;
  intent?: 'neutral' | 'destructive';
  isChecked?: boolean;
  className?: string;
  children: ReadonlyArray<Child>;
}>;

export type ItemContext = Readonly<{ isActive: boolean; isDisabled: boolean }>;

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

export const toPlacement = (side: Side, align: Align): NonNullable<AnchorConfig['placement']> => {
  if (align === 'center') {
    return side;
  } else {
    return `${side}-${align}`;
  }
};

export type TriggerConfig = Readonly<{
  intent?: Intent;
  emphasis?: Emphasis;
  size?: ButtonSize;
  ariaLabel?: string;
  className?: string;
  children: ReadonlyArray<Child>;
}>;

export type MenuConfig<Item extends string, ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  slotId?: string;
  items: ReadonlyArray<Item>;
  itemToConfig: (item: Item, context: ItemContext) => ItemConfig;
  isItemDisabled?: (item: Item, index: number) => boolean;
  itemToSearchText?: (item: Item, index: number) => string;
  itemGroupKey?: (item: Item, index: number) => string;
  groupToLabel?: (groupKey: string) => string | undefined;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
  className?: string;
}>;

export type ViewConfig<Item extends string, ParentMessage> = MenuConfig<Item, ParentMessage> &
  Readonly<{
    trigger: TriggerConfig;
    wrapperClassName?: string;
  }>;

export type ButtonRender<ParentMessage> = Readonly<{
  content: Html;
  className: string;
  attributes: ReadonlyArray<Attribute<ParentMessage>>;
  ariaLabel?: string | undefined;
}>;

export type SlottedConfig<Item extends string, ParentMessage> = MenuConfig<Item, ParentMessage> &
  Readonly<{
    slot: MenuSlot;
    button: ButtonRender<ParentMessage>;
    wrapperClassName: string;
    backdropAttributes?: ReadonlyArray<Attribute<ParentMessage>>;
  }>;

const indicator = <ParentMessage>(kind: ItemKind, isChecked: boolean, h: HtmlBuilder<ParentMessage>): Array<Html> => {
  if (kind === 'Item') {
    return [];
  } else {
    return [
      h.span(
        [h.Class('pointer-events-none absolute left-menu-item-pad flex size-icon items-center justify-center')],
        isChecked ? [kind === 'Checkbox' ? icon('check') : icon('circle', { className: 'size-2 fill-current' })] : [],
      ),
    ];
  }
};

export const slottedView = <Item extends string, ParentMessage>(
  primitiveView: MenuPrimitive.Bundle<Item>['view'],
  config: SlottedConfig<Item, ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const {
    model,
    toParentMessage,
    slotId = model.id,
    items,
    itemToConfig,
    isItemDisabled,
    itemToSearchText,
    itemGroupKey,
    groupToLabel,
    side = 'bottom',
    align = 'center',
    sideOffset = 4,
    alignOffset = 0,
    slot,
    button,
    className,
    wrapperClassName,
    backdropAttributes = [],
  } = config;

  const toMenuItemConfig = (item: Item, context: ItemContext): MenuPrimitive.ItemConfig => {
    const {
      kind = 'Item',
      intent: itemIntent = 'neutral',
      isChecked = false,
      className: itemClassName,
      children: itemChildren,
    } = itemToConfig(item, context);
    return {
      className: cn(itemVariants({ intent: itemIntent, indicator: kind !== 'Item' }), itemClassName),
      content: h.div([h.Class('contents')], [...indicator(kind, isChecked, h), ...itemChildren]),
    };
  };

  return h.submodel({
    slotId,
    model,
    view: primitiveView,
    viewInputs: {
      items,
      itemToConfig: toMenuItemConfig,
      ...(isItemDisabled === undefined ? {} : { isItemDisabled }),
      ...(itemToSearchText === undefined ? {} : { itemToSearchText }),
      ...(itemGroupKey === undefined ? {} : { itemGroupKey }),
      groupToHeading: (groupKey: string) => {
        const label = groupToLabel?.(groupKey);
        return label === undefined ? undefined : { content: h.span([], [label]), className: labelClassName };
      },
      groupAttributes: childAttributes([h.DataAttribute('slot', `${slot}-group`)]),
      separatorClassName,
      separatorAttributes: childAttributes([h.DataAttribute('slot', `${slot}-separator`)]),
      buttonContent: button.content,
      buttonClassName: button.className,
      buttonAttributes: childAttributes(button.attributes),
      itemsClassName: cn(popupClassName, className),
      itemsAttributes: childAttributes([
        h.DataAttribute('slot', `${slot}-content`),
        h.DataAttribute('surface', 'popup'),
      ]),
      backdropClassName: 'fixed inset-0 z-40',
      backdropAttributes: childAttributes(backdropAttributes),
      className: wrapperClassName,
      attributes: childAttributes([h.DataAttribute('slot', slot)]),
      anchor: { placement: toPlacement(side, align), gap: sideOffset, offset: alignOffset, padding: 8 },
      ...(button.ariaLabel === undefined ? {} : { ariaLabel: button.ariaLabel }),
    },
    toParentMessage,
  });
};

export type Bundle<Item extends string> = Readonly<{
  update: MenuPrimitive.Bundle<Item>['update'];
  open: MenuPrimitive.Bundle<Item>['open'];
  close: MenuPrimitive.Bundle<Item>['close'];
  selectItem: MenuPrimitive.Bundle<Item>['selectItem'];
  view: <ParentMessage>(config: ViewConfig<Item, ParentMessage>, h: HtmlBuilder<ParentMessage>) => Html;
}>;

export const create = <Item extends string>(): Bundle<Item> => {
  const primitive = MenuPrimitive.create<Item>();

  const view = <ParentMessage>(config: ViewConfig<Item, ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
    const { trigger, wrapperClassName, ...menuConfig } = config;
    const { intent, emphasis, size = 'default', ariaLabel, className: buttonClassName, children } = trigger;
    return slottedView(
      primitive.view,
      {
        ...menuConfig,
        slot: 'dropdown-menu',
        wrapperClassName: cn('relative inline-flex', wrapperClassName),
        button: {
          content: h.span([h.Class('contents')], children),
          className: buttonVariants({ intent, emphasis, size, className: buttonClassName }),
          attributes: [h.DataAttribute('slot', 'button'), h.DataAttribute('size', size)],
          ariaLabel,
        },
      },
      h,
    );
  };

  return {
    update: primitive.update,
    open: primitive.open,
    close: primitive.close,
    selectItem: primitive.selectItem,
    view,
  };
};

export const shortcut = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'dropdown-menu-shortcut'),
      h.Class(cn('ml-auto text-caption tracking-widest text-faint-foreground', className)),
      ...attributes,
    ],
    children,
  );

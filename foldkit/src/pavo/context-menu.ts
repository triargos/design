import { Menu as MenuPrimitive } from '@foldkit/ui';
import { Option, Schema } from 'effect';
import { Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { cn } from './cn.ts';
import * as DropdownMenu from './dropdown-menu.ts';
import type { Child } from './part.ts';

const SECONDARY_POINTER_BUTTON = 2;
const DEFAULT_LABEL = 'Context menu';

const Point = Schema.Struct({ x: Schema.Number, y: Schema.Number });
type Point = typeof Point.Type;

export const Model = Schema.Struct({
  menu: DropdownMenu.Model,
  maybePressedPoint: Schema.Option(Point),
  maybeAnchorPoint: Schema.Option(Point),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  PressedPointer: { button: Schema.Number, x: Schema.Number, y: Schema.Number },
  RequestedMenu: {},
  RequestedClose: {},
  GotMenuMessage: { message: DropdownMenu.Message },
});
export type Message = typeof Message.Type;

export const OutMessage = DropdownMenu.OutMessage;
export type OutMessage = DropdownMenu.OutMessage;

export type InitConfig = Readonly<{ id: string }>;

export const init = ({ id }: InitConfig): Model => ({
  menu: DropdownMenu.init({ id, isAnimated: true, isModal: true }),
  maybePressedPoint: Option.none(),
  maybeAnchorPoint: Option.none(),
});

export const isOpen = (model: Model): boolean => model.menu.isOpen;

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const menuFold = {
  read: (model: Model) => Option.some(model.menu),
  write: (model: Model, nextMenu: DropdownMenu.Model) => modifyFields(model, { menu: () => nextMenu }),
  toParentMessage: (message: DropdownMenu.Message): Message => Message.GotMenuMessage({ message }),
  toParentOutMessage: (outMessage: OutMessage): OutMessage => outMessage,
};

const Menu = MenuPrimitive.create<string>();

const foldMenu = Update.foldChild({ update: Menu.update, ...menuFold });
const foldMenuOpen = Update.foldChildStep({ update: Menu.open, ...menuFold });
const foldMenuClose = Update.foldChildStep({ update: Menu.close, ...menuFold });

const anchorAtPressedPoint = (model: Model): Model =>
  modifyFields(model, {
    maybeAnchorPoint: () => model.maybePressedPoint,
    maybePressedPoint: () => Option.none(),
  });

export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    PressedPointer: ({ button, x, y }) =>
      button === SECONDARY_POINTER_BUTTON
        ? { model: modifyFields(model, { maybePressedPoint: () => Option.some({ x, y }) }) }
        : { model },
    RequestedMenu: () => (isOpen(model) ? foldMenuClose(model) : foldMenuOpen(anchorAtPressedPoint(model))),
    RequestedClose: () => foldMenuClose(model),
    GotMenuMessage: ({ message }) => foldMenu(model, message),
  });

export type TriggerConfig = Readonly<{
  className?: string;
  children: ReadonlyArray<Child>;
}>;

export type ViewConfig<ParentMessage> = Omit<
  DropdownMenu.MenuConfig<string, ParentMessage>,
  'model' | 'toParentMessage' | 'side' | 'align' | 'sideOffset' | 'alignOffset'
> &
  Readonly<{
    model: Model;
    toParentMessage: (message: Message) => ParentMessage;
    trigger: TriggerConfig;
    ariaLabel?: string;
  }>;

const anchorStyle = (maybeAnchorPoint: Option.Option<Point>): Readonly<Record<string, string>> =>
  Option.match(maybeAnchorPoint, {
    onNone: () => ({ position: 'absolute', left: '50%', top: '50%' }),
    onSome: ({ x, y }) => ({ position: 'fixed', left: `${x}px`, top: `${y}px` }),
  });

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, trigger, ariaLabel = DEFAULT_LABEL, slotId = model.menu.id, ...menuConfig } = config;
  const toMenuMessage = (message: DropdownMenu.Message): ParentMessage =>
    toParentMessage(Message.GotMenuMessage({ message }));

  return h.div(
    [
      h.DataAttribute('slot', 'context-menu-trigger'),
      h.OnPointerDown((_pointerType, button, _screenX, _screenY, _timeStamp, clientX, clientY) =>
        Option.some(toParentMessage(Message.PressedPointer({ button, x: clientX, y: clientY }))),
      ),
      h.OnContextMenu(toParentMessage(Message.RequestedMenu())),
      h.Class(cn('relative', trigger.className)),
    ],
    [
      ...trigger.children,
      DropdownMenu.slottedView(
        Menu.view,
        {
          ...menuConfig,
          slotId,
          model: model.menu,
          toParentMessage: toMenuMessage,
          slot: 'context-menu',
          side: 'right',
          align: 'start',
          sideOffset: 0,
          alignOffset: 4,
          wrapperClassName: 'contents',
          backdropAttributes: [h.OnContextMenu(toParentMessage(Message.RequestedClose()))],
          button: {
            content: h.span([]),
            className: 'pointer-events-none size-0 overflow-hidden border-0 p-0 opacity-0',
            attributes: [h.Tabindex(-1), h.Style(anchorStyle(model.maybeAnchorPoint))],
            ariaLabel,
          },
        },
        h,
      ),
    ],
  );
};

export const { shortcut } = DropdownMenu;

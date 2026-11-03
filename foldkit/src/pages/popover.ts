import { Array, Option, Record, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import type { Side } from '../pavo/placement.ts';
import * as Popover from '../pavo/popover.ts';

export const title = 'Popover';
export const description = 'A floating surface for a title, a sentence and one action.';

const PopoverKey = Schema.Literals(['Default', 'Top', 'Right', 'Bottom', 'Left']);
type PopoverKey = typeof PopoverKey.Type;

export const Model = Schema.Struct({
  popovers: Schema.Record(PopoverKey, Popover.Model),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedExtend: {},
  GotPopoverMessage: { key: PopoverKey, message: Popover.Message },
});
export type Message = typeof Message.Type;

const initPopover = (key: PopoverKey): Popover.Model => Popover.init({ id: `popover-${key}`, isAnimated: true });

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    popovers: {
      Default: initPopover('Default'),
      Top: initPopover('Top'),
      Right: initPopover('Right'),
      Bottom: initPopover('Bottom'),
      Left: initPopover('Left'),
    },
  },
});

const toPopoverMessage = (key: PopoverKey, message: Popover.Message): Message =>
  Message.GotPopoverMessage({ key, message });

const foldPopoverOutMessage = (_key: PopoverKey) =>
  Popover.OutMessage.match<Update.Step<Model, Message>>({
    Opened: () => (stepModel) => ({ model: stepModel }),
    Closed: () => (stepModel) => ({ model: stepModel }),
  });

const foldPopover = Update.foldChildAt({
  update: Popover.update,
  readAt: (model: Model, key: PopoverKey) => Option.some(model.popovers[key]),
  writeAt: (model: Model, key: PopoverKey, nextPopover: Popover.Model) =>
    modifyFields(model, { popovers: Record.set(key, nextPopover) }),
  toParentMessage: toPopoverMessage,
  foldOutMessage: foldPopoverOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedExtend: () => foldPopover(model, 'Default', Popover.Message.RequestedClose()),
    GotPopoverMessage: ({ key, message }) => foldPopover(model, key, message),
  });

type PopoverConfig = Omit<Popover.ViewConfig<Message>, 'model' | 'toParentMessage'>;

const popover = (model: Model, key: PopoverKey, config: PopoverConfig, h: HtmlBuilder<Message>): Html =>
  Popover.view(
    { model: model.popovers[key], toParentMessage: (message) => toPopoverMessage(key, message), ...config },
    h,
  );

const defaultExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  popover(
    model,
    'Default',
    {
      trigger: { children: ['Deadline'] },
      align: 'start',
      initialFocus: 'FirstTabbable',
      content: () => [
        Popover.header(
          {
            children: [
              Popover.title({ children: ['Extend the deadline'] }, h),
              Popover.description({ children: ['Members can submit their tasks until the new date.'] }, h),
            ],
          },
          h,
        ),
        Button.view(
          { intent: 'primary', className: 'self-end', onClick: Message.ClickedExtend(), children: ['Extend'] },
          h,
        ),
      ],
    },
    h,
  );

const SIDES: ReadonlyArray<Readonly<{ key: PopoverKey; side: Side }>> = [
  { key: 'Top', side: 'top' },
  { key: 'Right', side: 'right' },
  { key: 'Bottom', side: 'bottom' },
  { key: 'Left', side: 'left' },
];

const positionsExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-wrap items-center gap-2')],
    Array.map(SIDES, ({ key, side }) =>
      popover(
        model,
        key,
        {
          trigger: { children: [key] },
          side,
          className: 'w-48',
          content: () => [Popover.description({ children: [`Opens on the ${side}.`] }, h)],
        },
        h,
      ),
    ),
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'Anything that is not a menu or a list, floating one step above the page: a title, a sentence, one action. Menus, popovers and selects share the surface and enter from their trigger.',
      sections: [
        exampleSection({ title: 'Default', children: [defaultExample(model, h)] }, h),
        exampleSection(
          {
            title: 'Positions',
            description: [code('side', h), ' picks the edge; it flips away from the viewport edge.'],
            children: [positionsExample(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

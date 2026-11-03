import { Option, Schema } from 'effect';
import { Submodel, Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import { icon } from '../pavo/icon.ts';
import * as Item from '../pavo/item.ts';
import * as Sortable from '../pavo/sortable.ts';
import * as StatusDot from '../pavo/status-dot.ts';

export const title = 'Sortable';
export const description = 'Rows a person puts in order themselves.';

const StatusIntent = Schema.Literals(['info', 'warning', 'success', 'destructive']);

const TaskStatus = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  intent: StatusIntent,
});
type TaskStatus = typeof TaskStatus.Type;

const INITIAL_STATUSES: ReadonlyArray<TaskStatus> = [
  { id: 'todo', title: 'To do', description: 'Not started yet', intent: 'info' },
  { id: 'progress', title: 'In progress', description: 'Someone is on it', intent: 'warning' },
  { id: 'done', title: 'Done', description: 'Shipped and checked', intent: 'success' },
  { id: 'blocked', title: 'Blocked', description: 'Waiting on something', intent: 'destructive' },
];

const STATUS_LIST_ID = 'sortable-statuses';

export const Model = Schema.Struct({
  statuses: Schema.Array(TaskStatus),
  statusSort: Sortable.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotStatusSortMessage: { message: Sortable.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { statuses: INITIAL_STATUSES, statusSort: Sortable.init({ id: STATUS_LIST_ID }) },
});

const toStatusSortMessage = (message: Sortable.Message): Message => Message.GotStatusSortMessage({ message });

const statusId = (status: TaskStatus): string => status.id;

const foldStatusSortOutMessage = Sortable.OutMessage.match<Update.Step<Model, Message>>({
  Reordered:
    ({ itemId, toIndex }) =>
    (stepModel) => ({
      model: modifyFields(stepModel, {
        statuses: (statuses) => Sortable.moveItem(statuses, statusId, itemId, toIndex),
      }),
    }),
  Cancelled: () => (stepModel) => ({ model: stepModel }),
});

const foldStatusSort = Update.foldChild({
  update: Sortable.update,
  read: (model: Model) => Option.some(model.statusSort),
  write: (model: Model, nextStatusSort: Sortable.Model) => modifyFields(model, { statusSort: () => nextStatusSort }),
  toParentMessage: toStatusSortMessage,
  foldOutMessage: foldStatusSortOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotStatusSortMessage: ({ message }) => foldStatusSort(model, message),
  });

export const subscriptions = Subscription.lift({
  sortableDragPointer: Sortable.subscriptions.documentPointer,
  sortableDragEscape: Sortable.subscriptions.documentEscape,
  sortableDragKeyboard: Sortable.subscriptions.documentKeyboard,
  sortableAutoScroll: Sortable.subscriptions.autoScroll,
})<Model, Message>({
  read: (model) => Option.some(model.statusSort),
  toParentMessage: toStatusSortMessage,
});

const statusRow = (model: Model, status: TaskStatus, index: number, h: HtmlBuilder<Message>): Html =>
  Item.view(
    {
      className: Sortable.itemClassName(Sortable.isItemDragging(model.statusSort, status.id), 'flex-nowrap bg-card'),
      attributes: [h.Key(status.id)],
      children: [
        Item.media(
          {
            children: [
              Sortable.handle(
                {
                  model: model.statusSort,
                  toParentMessage: toStatusSortMessage,
                  itemId: status.id,
                  containerId: STATUS_LIST_ID,
                  index,
                  ariaLabel: `Move ${status.title}`,
                },
                h,
              ),
            ],
          },
          h,
        ),
        Item.content(
          {
            className: 'flex-none',
            children: [
              Item.title(
                {
                  className: 'whitespace-nowrap',
                  children: [StatusDot.view({ intent: status.intent }, h), status.title],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Item.actions(
          {
            className: 'min-w-0 flex-1 justify-end',
            children: [
              h.span([h.Class('truncate text-muted-foreground')], [status.description]),
              Button.view(
                {
                  emphasis: 'ghost',
                  size: 'icon-sm',
                  ariaLabel: `Actions for ${status.title}`,
                  children: [icon('dots')],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const statusCard = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header({ children: [Card.title({ children: ['Task statuses'] }, h)] }, h),
        Card.content(
          {
            className: 'overflow-hidden',
            children: [
              Item.list(
                {
                  attributes: Sortable.list<Message>(STATUS_LIST_ID),
                  children: Sortable.previewOrder(model.statusSort, model.statuses, statusId).map((status, index) =>
                    statusRow(model, status, index, h),
                  ),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description: 'Rows a person puts in order themselves.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'Drag a row by its handle, or Tab to it, Space to lift, arrows to move, Space to drop.',
            isBare: true,
            children: [statusCard(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

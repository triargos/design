import { Array, Duration, Effect, Option, Schema } from 'effect';
import { Command, Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Badge from '../pavo/badge.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import { icon } from '../pavo/icon.ts';
import * as Item from '../pavo/item.ts';
import type { Child } from '../pavo/part.ts';

export const title = 'Item';
export const description = 'A row in a list: media, title and description, actions.';

const ACTIONS = ['created a task', 'commented on a task', 'uploaded a document', 'paid an invoice'] as const;
const ACTIVITY_MEMBERS = ['Maya Chen', 'Jonas Weber', 'Priya Patel', 'Leo Martin', 'Sofia Rossi'] as const;

type Activity = Readonly<{ id: string; title: string; description: string }>;

const ACTIVITY: ReadonlyArray<Activity> = Array.makeBy(1000, (index) => ({
  id: String(index),
  title: `${ACTIVITY_MEMBERS[index % ACTIVITY_MEMBERS.length]} ${ACTIONS[index % ACTIONS.length]}`,
  description: `Project Atlas · ${index + 1} min ago`,
}));

const INVOICE_PAGE_SIZE = 20;
const INVOICE_TOTAL = 100;
const LOAD_LATENCY = Duration.millis(800);
const RELOAD_LATENCY = Duration.millis(1500);

type Invoice = Readonly<{ id: string; title: string }>;

const INVOICES: ReadonlyArray<Invoice> = Array.makeBy(INVOICE_TOTAL, (index) => ({
  id: String(index),
  title: `Invoice INV-${String(index + 1).padStart(4, '0')}`,
}));

const DOCUMENTS = [
  { id: 'brand', name: 'Brand guidelines.pdf', uploaded: 'Uploaded on March 12' },
  { id: 'roadmap', name: 'Q2 roadmap.pdf', uploaded: 'Uploaded on March 14' },
  { id: 'invoice', name: 'Invoice 2024-0193.pdf', uploaded: 'Uploaded on March 20' },
] as const;

export const Model = Schema.Struct({
  isDocumentsLoading: Schema.Boolean,
  activityList: Item.VirtualListModel,
  invoiceList: Item.VirtualListModel,
  invoiceCount: Schema.Number,
  isLoadingMoreInvoices: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedReloadDocuments: {},
  CompletedLoadDocuments: {},
  CompletedLoadInvoices: {},
  GotActivityListMessage: { message: Item.VirtualListMessage },
  GotInvoiceListMessage: { message: Item.VirtualListMessage },
});
export type Message = typeof Message.Type;

const LoadDocuments = Command.define('LoadDocuments', {
  messages: [Message.CompletedLoadDocuments],
  execute: Effect.sleep(RELOAD_LATENCY).pipe(Effect.as(Message.CompletedLoadDocuments())),
});

const LoadInvoices = Command.define('LoadInvoices', {
  messages: [Message.CompletedLoadInvoices],
  execute: Effect.sleep(LOAD_LATENCY).pipe(Effect.as(Message.CompletedLoadInvoices())),
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    isDocumentsLoading: true,
    activityList: Item.initVirtualList({ id: 'item-activity', estimatedItemSize: 60 }),
    invoiceList: Item.initVirtualList({ id: 'item-invoices', estimatedItemSize: 44 }),
    invoiceCount: INVOICE_PAGE_SIZE,
    isLoadingMoreInvoices: false,
  },
  commands: [LoadDocuments()],
});

const foldActivityList = Update.foldChild({
  update: Item.updateVirtualList,
  read: (model: Model) => Option.some(model.activityList),
  write: (model: Model, activityList: Item.VirtualListModel) =>
    modifyFields(model, { activityList: () => activityList }),
  toParentMessage: (message: Item.VirtualListMessage): Message => Message.GotActivityListMessage({ message }),
});

const foldInvoiceList = Update.foldChild({
  update: Item.updateVirtualList,
  read: (model: Model) => Option.some(model.invoiceList),
  write: (model: Model, invoiceList: Item.VirtualListModel) => modifyFields(model, { invoiceList: () => invoiceList }),
  toParentMessage: (message: Item.VirtualListMessage): Message => Message.GotInvoiceListMessage({ message }),
});

const hasMoreInvoices = (model: Model): boolean => model.invoiceCount < INVOICE_TOTAL;

const loadMoreInvoicesNearEnd =
  (message: Item.VirtualListMessage): Update.Step<Model, Message> =>
  (model) =>
    Item.isNearEnd(message) && hasMoreInvoices(model) && !model.isLoadingMoreInvoices
      ? { model: modifyFields(model, { isLoadingMoreInvoices: () => true }), commands: [LoadInvoices()] }
      : { model };

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedReloadDocuments: () => ({
      model: modifyFields(model, { isDocumentsLoading: () => true }),
      commands: [LoadDocuments()],
    }),
    CompletedLoadDocuments: () => ({ model: modifyFields(model, { isDocumentsLoading: () => false }) }),
    CompletedLoadInvoices: () => ({
      model: modifyFields(model, {
        invoiceCount: (count) => Math.min(count + INVOICE_PAGE_SIZE, INVOICE_TOTAL),
        isLoadingMoreInvoices: () => false,
      }),
    }),
    GotActivityListMessage: ({ message: childMessage }) => foldActivityList(model, childMessage),
    GotInvoiceListMessage: ({ message: childMessage }) =>
      Update.combine(model, [
        (stepModel: Model) => foldInvoiceList(stepModel, childMessage),
        loadMoreInvoicesNearEnd(childMessage),
      ]),
  });

const listCard = (
  cardTitle: ReadonlyArray<Child>,
  list: Html,
  h: HtmlBuilder<Message>,
  className = 'w-full max-w-xl',
): Html =>
  Card.view(
    {
      className,
      children: [
        Card.header({ children: [Card.title({ children: cardTitle }, h)] }, h),
        Card.content({ className: 'overflow-hidden', children: [list] }, h),
      ],
    },
    h,
  );

const row = (
  rowTitle: ReadonlyArray<Child>,
  rowDescription: string | undefined,
  h: HtmlBuilder<Message>,
  before: ReadonlyArray<Html> = [],
  after: ReadonlyArray<Html> = [],
): ReadonlyArray<Html> => [
  ...before,
  Item.content(
    {
      children: [
        Item.title({ children: rowTitle }, h),
        ...(rowDescription === undefined ? [] : [Item.description({ children: [rowDescription] }, h)]),
      ],
    },
    h,
  ),
  ...after,
];

const fileIcon = (h: HtmlBuilder<Message>): Html => Item.media({ variant: 'icon', children: [icon('file-text')] }, h);

const defaultExample = (h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Projects'],
    Item.list(
      {
        children: ['Website redesign', 'Mobile app'].map((name) =>
          Item.view({ children: row([name], undefined, h) }, h),
        ),
      },
      h,
    ),
    h,
  );

const withDescription = (h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Members'],
    Item.list(
      {
        children: [
          Item.view({ children: row(['Jordan Lee'], 'jordan@acme.com', h) }, h),
          Item.view({ children: row(['Sam Rivera'], 'sam@acme.com', h) }, h),
        ],
      },
      h,
    ),
    h,
  );

const withMedia = (h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Documents'],
    Item.list(
      {
        children: [
          Item.view({ children: row(['Brand guidelines.pdf'], 'Uploaded on March 12', h, [fileIcon(h)]) }, h),
          Item.view({ children: row(['Q2 roadmap.pdf'], undefined, h, [fileIcon(h)]) }, h),
        ],
      },
      h,
    ),
    h,
  );

const MEMBERS = [
  { name: 'Jordan Lee', email: 'jordan@acme.com', label: 'Active', intent: 'success' },
  { name: 'Sam Rivera', email: 'sam@acme.com', label: 'Invited', intent: 'warning' },
] as const;

const withActions = (h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Members'],
    Item.list(
      {
        children: MEMBERS.map((member) =>
          Item.view(
            {
              children: row(
                [member.name],
                member.email,
                h,
                [],
                [
                  Item.actions(
                    {
                      children: [
                        Badge.view({ intent: member.intent, children: [member.label] }, h),
                        Button.view(
                          {
                            emphasis: 'ghost',
                            size: 'icon-sm',
                            ariaLabel: `Actions for ${member.name}`,
                            children: [icon('dots')],
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                ],
              ),
            },
            h,
          ),
        ),
      },
      h,
    ),
    h,
  );

const longTitles = (h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Documents'],
    Item.list(
      {
        children: [
          Item.view(
            {
              children: row(
                ['Quarterly planning notes for the website redesign and the mobile app.pdf'],
                'Uploaded on March 12',
                h,
                [fileIcon(h)],
              ),
            },
            h,
          ),
          Item.view(
            {
              children: row(
                [
                  h.span([], ['Invoice 2024-0193 for the design system workshop.pdf']),
                  Badge.view({ size: 'sm', children: ['Draft'] }, h),
                ],
                'Uploaded on March 14',
                h,
                [fileIcon(h)],
              ),
            },
            h,
          ),
        ],
      },
      h,
    ),
    h,
    'w-full max-w-sm',
  );

const headerAndFooter = (h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Review requests'],
    Item.list(
      {
        children: [
          Item.view(
            {
              children: [
                Item.header(
                  {
                    children: [
                      h.span([h.Class('text-caption text-muted-foreground')], ['Requested on March 12']),
                      Badge.view({ intent: 'warning', children: ['Pending'] }, h),
                    ],
                  },
                  h,
                ),
                ...row(['Homepage copy · Website redesign'], 'Waiting for a second reviewer.', h),
                Item.footer(
                  {
                    children: [
                      h.span([h.Class('text-caption text-muted-foreground')], ['1 of 2 approvals']),
                      Button.view({ size: 'sm', children: ['Remind'] }, h),
                    ],
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
    ),
    h,
  );

const link = (h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Projects'],
    Item.list(
      {
        children: [
          Item.view(
            {
              href: '#website-redesign',
              children: row(['Website redesign'], '3 open tasks', h, [], [Item.chevron()]),
            },
            h,
          ),
          Item.view(
            { href: '#mobile-app', children: row(['Mobile app'], 'No open tasks', h, [], [Item.chevron()]) },
            h,
          ),
        ],
      },
      h,
    ),
    h,
  );

const selected = (h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Members'],
    Item.list(
      {
        children: [
          Item.view({ isSelected: true, children: row(['Jordan Lee'], 'Selected', h) }, h),
          Item.view({ children: row(['Sam Rivera'], undefined, h) }, h),
          Item.view({ children: row(['Priya Patel'], undefined, h) }, h),
        ],
      },
      h,
    ),
    h,
  );

const loading = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header(
          {
            actions: [
              Button.view(
                {
                  size: 'sm',
                  isDisabled: model.isDocumentsLoading,
                  onClick: Message.ClickedReloadDocuments(),
                  children: ['Reload'],
                },
                h,
              ),
            ],
            children: [Card.title({ children: ['Documents'] }, h)],
          },
          h,
        ),
        Card.content(
          {
            className: 'overflow-hidden',
            attributes: [h.AriaBusy(model.isDocumentsLoading)],
            children: [
              model.isDocumentsLoading
                ? Item.listSkeleton({ rows: DOCUMENTS.length, media: 'icon' }, h)
                : Item.list(
                    {
                      ariaLabel: 'Documents',
                      children: DOCUMENTS.map((document) =>
                        Item.view({ children: row([document.name], document.uploaded, h, [fileIcon(h)]) }, h),
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

const skeletonShapes = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('grid w-full max-w-3xl items-start gap-group md:grid-cols-3')],
    [
      listCard(['Projects'], Item.listSkeleton({ rows: 3, hasDescription: false }, h), h, ''),
      listCard(['Documents'], Item.listSkeleton({ rows: 3, media: 'icon' }, h), h, ''),
      listCard(['Members'], Item.listSkeleton({ rows: 3, media: 'avatar' }, h), h, ''),
    ],
  );

const activityRow = (activity: Activity, h: HtmlBuilder<Message>): Html =>
  Item.view({ children: row([activity.title], activity.description, h) }, h);

const virtualized = (model: Model, h: HtmlBuilder<Message>): Html =>
  listCard(
    ['Activity'],
    Item.virtualList(
      {
        model: model.activityList,
        toParentMessage: (message) => Message.GotActivityListMessage({ message }),
        items: ACTIVITY,
        itemKey: (activity) => activity.id,
        itemToView: (activity) => activityRow(activity, h),
        className: 'h-80',
      },
      h,
    ),
    h,
    'w-full max-w-md',
  );

const loadingMore = (model: Model, h: HtmlBuilder<Message>): Html =>
  listCard(
    [`${model.invoiceCount} of ${INVOICE_TOTAL} invoices`],
    Item.virtualList(
      {
        model: model.invoiceList,
        toParentMessage: (message) => Message.GotInvoiceListMessage({ message }),
        items: INVOICES.slice(0, model.invoiceCount),
        itemKey: (invoice) => invoice.id,
        itemToView: (invoice) => Item.view({ children: row([invoice.title], undefined, h) }, h),
        isLoadingMore: model.isLoadingMoreInvoices,
        className: 'h-80',
      },
      h,
    ),
    h,
    'w-full max-w-md',
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description,
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('Item.content · Item.title', h), ' in an ', code('Item.list', h), ', in a card.'],
            isBare: true,
            children: [defaultExample(h)],
          },
          h,
        ),
        exampleSection({ title: 'With description', isBare: true, children: [withDescription(h)] }, h),
        exampleSection(
          {
            title: 'With media',
            description: [code("Item.media variant: 'icon'", h), '; an Avatar for people.'],
            isBare: true,
            children: [withMedia(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With actions',
            description: 'A status and a ghost menu button on the right.',
            isBare: true,
            children: [withActions(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Long titles',
            description: [
              'One line, then an ellipsis. Beside a badge or an icon, the text goes in a ',
              code('span', h),
              '.',
            ],
            isBare: true,
            children: [longTitles(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Header and footer',
            description: [code('Item.header', h), ' and ', code('Item.footer', h), ' span the full width.'],
            isBare: true,
            children: [headerAndFooter(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Link',
            description: [
              code('href', h),
              ': the row highlights on hover and ends in an ',
              code('Item.chevron', h),
              ', which nudges right.',
            ],
            isBare: true,
            children: [link(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Selected',
            description: ['A ', code('isSelected', h), ' row takes a quiet fill.'],
            isBare: true,
            children: [selected(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Loading',
            description: [
              code('Item.listSkeleton', h),
              ' stands in for the ',
              code('Item.list', h),
              ': the same rows, so the card keeps its height. Reload to see it.',
            ],
            isBare: true,
            children: [loading(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Skeleton rows',
            description: [
              code('hasDescription: false', h),
              ' for a title alone; ',
              code('media', h),
              ' ',
              code('icon', h),
              ' · ',
              code('avatar', h),
              ' as the real rows carry.',
            ],
            isBare: true,
            children: [skeletonShapes(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Virtualized',
            description: [
              code('Item.virtualList items itemKey', h),
              ': 1,000 rows, only those in view render. Give it a height.',
            ],
            isBare: true,
            children: [virtualized(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Loading more',
            description: [
              code('Item.isNearEnd', h),
              ' in the parent update; ',
              code('isLoadingMore', h),
              ' shows a spinner. Scroll down.',
            ],
            isBare: true,
            children: [loadingMore(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

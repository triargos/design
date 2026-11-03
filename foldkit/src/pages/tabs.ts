import { Option, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Card from '../pavo/card.ts';
import { icon } from '../pavo/icon.ts';
import * as Tabs from '../pavo/tabs.ts';

export const title = 'Tabs';
export const description = 'Tabs in three variants, with an indicator that slides between them.';

const SelectedTabs = Schema.Struct({ tabs: Tabs.Model, selectedValue: Schema.String });
type SelectedTabs = typeof SelectedTabs.Type;

export const Model = Schema.Struct({
  defaultTabs: SelectedTabs,
  underlineTabs: SelectedTabs,
  pillTabs: SelectedTabs,
  inACardTabs: SelectedTabs,
  period: Schema.String,
  theme: Schema.String,
  documentsView: Schema.String,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotDefaultTabsMessage: { message: Tabs.Message },
  GotUnderlineTabsMessage: { message: Tabs.Message },
  GotPillTabsMessage: { message: Tabs.Message },
  GotInACardTabsMessage: { message: Tabs.Message },
  UpdatedPeriod: { value: Schema.String },
  UpdatedTheme: { value: Schema.String },
  UpdatedDocumentsView: { value: Schema.String },
});
export type Message = typeof Message.Type;

const initSelectedTabs = (id: string, selectedValue: string): SelectedTabs => ({
  tabs: Tabs.init({ id }),
  selectedValue,
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    defaultTabs: initSelectedTabs('tabs-default', 'all'),
    underlineTabs: initSelectedTabs('tabs-underline', 'all'),
    pillTabs: initSelectedTabs('tabs-pill', 'all'),
    inACardTabs: initSelectedTabs('tabs-in-a-card', 'details'),
    period: 'week',
    theme: 'system',
    documentsView: 'forYou',
  },
});

type SelectedTabsKey = 'defaultTabs' | 'underlineTabs' | 'pillTabs' | 'inACardTabs';

const writeSelectedTabs = (model: Model, key: SelectedTabsKey, nextSelectedTabs: SelectedTabs): Model => ({
  ...model,
  [key]: nextSelectedTabs,
});

const foldSelectedTabs = (key: SelectedTabsKey, toParentMessage: (message: Tabs.Message) => Message) =>
  Update.foldChild({
    update: Tabs.update,
    read: (model: Model) => Option.some(model[key].tabs),
    write: (model: Model, nextTabs: Tabs.Model) => writeSelectedTabs(model, key, { ...model[key], tabs: nextTabs }),
    toParentMessage,
    foldOutMessage: Tabs.OutMessage.match<Update.Step<Model, Message>>({
      Selected:
        ({ value }) =>
        (stepModel) => ({
          model: writeSelectedTabs(stepModel, key, { ...stepModel[key], selectedValue: value }),
        }),
    }),
  });

const toDefaultTabsMessage = (message: Tabs.Message): Message => Message.GotDefaultTabsMessage({ message });
const toUnderlineTabsMessage = (message: Tabs.Message): Message => Message.GotUnderlineTabsMessage({ message });
const toPillTabsMessage = (message: Tabs.Message): Message => Message.GotPillTabsMessage({ message });
const toInACardTabsMessage = (message: Tabs.Message): Message => Message.GotInACardTabsMessage({ message });

const foldDefaultTabs = foldSelectedTabs('defaultTabs', toDefaultTabsMessage);
const foldUnderlineTabs = foldSelectedTabs('underlineTabs', toUnderlineTabsMessage);
const foldPillTabs = foldSelectedTabs('pillTabs', toPillTabsMessage);
const foldInACardTabs = foldSelectedTabs('inACardTabs', toInACardTabsMessage);

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotDefaultTabsMessage: ({ message }) => foldDefaultTabs(model, message),
    GotUnderlineTabsMessage: ({ message }) => foldUnderlineTabs(model, message),
    GotPillTabsMessage: ({ message }) => foldPillTabs(model, message),
    GotInACardTabsMessage: ({ message }) => foldInACardTabs(model, message),
    UpdatedPeriod: ({ value }) => ({ model: modifyFields(model, { period: () => value }) }),
    UpdatedTheme: ({ value }) => ({ model: modifyFields(model, { theme: () => value }) }),
    UpdatedDocumentsView: ({ value }) => ({ model: modifyFields(model, { documentsView: () => value }) }),
  });

const STATUS_TABS: ReadonlyArray<Tabs.Tab> = [
  { value: 'all', children: ['All'] },
  { value: 'open', children: ['Open'] },
  { value: 'done', children: ['Done'] },
  { value: 'archived', children: ['Archived'], isDisabled: true },
];

const statusTabs = (
  selectedTabs: SelectedTabs,
  variant: Tabs.TabsVariant,
  toParentMessage: (message: Tabs.Message) => Message,
  h: HtmlBuilder<Message>,
): Html =>
  Tabs.view(
    {
      model: selectedTabs.tabs,
      toParentMessage,
      tabs: STATUS_TABS,
      selectedValue: selectedTabs.selectedValue,
      ariaLabel: 'Status',
      variant,
    },
    h,
  );

const CARD_PANELS: Readonly<Record<string, string>> = {
  details: 'Due June 30, owned by Jordan Lee.',
  files: '2 files.',
  activity: 'Created on March 12.',
};

const inACard = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-md',
      children: [
        Card.header({ children: [Card.title({ children: ['Website redesign'] }, h)] }, h),
        Card.content(
          {
            className: 'p-card',
            children: [
              Tabs.view(
                {
                  model: model.inACardTabs.tabs,
                  toParentMessage: toInACardTabsMessage,
                  tabs: [
                    { value: 'details', children: ['Details'] },
                    { value: 'files', children: ['Files'] },
                    { value: 'activity', children: ['Activity'] },
                  ],
                  selectedValue: model.inACardTabs.selectedValue,
                  ariaLabel: 'Project',
                  variant: 'underline',
                  panel: (value) => [CARD_PANELS[value] ?? ''],
                  panelClassName: 'text-body text-muted-foreground',
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

const asNav = (h: HtmlBuilder<Message>): Html =>
  Tabs.nav(
    {
      links: [
        { href: '#overview', isCurrent: true, children: [icon('inbox'), 'Overview'] },
        { href: '#members', children: [icon('users'), 'Members'] },
        { href: '#settings', children: [icon('settings'), 'Settings'] },
      ],
    },
    h,
  );

const asRadio = (model: Model, h: HtmlBuilder<Message>): Html =>
  Tabs.radioGroup(
    {
      ariaLabel: 'Period',
      value: model.period,
      onValueChange: (value) => Message.UpdatedPeriod({ value }),
      radios: [
        { value: 'day', children: ['Today'] },
        { value: 'week', children: ['This week'] },
        { value: 'month', children: ['This month'] },
        { value: 'year', children: ['This year'] },
      ],
    },
    h,
  );

const inline = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-group')],
    [
      h.div(
        [h.Class('flex items-center justify-between gap-group')],
        [
          h.span([h.Id('tabs-inline-theme'), h.Class('text-control')], ['Appearance']),
          Tabs.radioGroup(
            {
              variant: 'inline',
              ariaLabelledBy: 'tabs-inline-theme',
              value: model.theme,
              onValueChange: (value) => Message.UpdatedTheme({ value }),
              radios: [
                { value: 'light', ariaLabel: 'Light', children: [icon('sun')] },
                { value: 'dark', ariaLabel: 'Dark', children: [icon('moon')] },
                { value: 'system', ariaLabel: 'System', children: [icon('device-desktop')] },
              ],
            },
            h,
          ),
        ],
      ),
      Tabs.radioGroup(
        {
          variant: 'inline',
          ariaLabel: 'Documents',
          className: 'w-full',
          value: model.documentsView,
          onValueChange: (value) => Message.UpdatedDocumentsView({ value }),
          radios: [
            { value: 'forYou', className: 'flex-1', children: ['For you'] },
            { value: 'uploads', className: 'flex-1', children: ['My uploads'] },
          ],
        },
        h,
      ),
    ],
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
            description:
              'Segmented: views of one page. The raised chip slides to the active tab. The last tab is disabled.',
            children: [statusTabs(model.defaultTabs, 'segmented', toDefaultTabsMessage, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Underline',
            description: 'Sections inside a card or a popup.',
            children: [statusTabs(model.underlineTabs, 'underline', toUnderlineTabsMessage, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Pill',
            description: 'Filters and single choices, in the brand fill.',
            children: [statusTabs(model.pillTabs, 'pill', toPillTabsMessage, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'As nav',
            description: [code('Tabs.nav', h), ': page links; ', code('isCurrent', h), ' marks the page.'],
            children: [asNav(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'As radio',
            description: [code('Tabs.radioGroup', h), ': a single choice, every pill a tab stop.'],
            children: [asRadio(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Inline',
            description: [
              code("variant: 'inline'", h),
              ': a segmented list, round and 2px into its track, for a control inside a row (a menu row’s theme switch). Icon-only tabs need an ',
              code('ariaLabel', h),
              '; ',
              code('flex-1', h),
              ' tabs fill the width.',
            ],
            children: [inline(model, h)],
          },
          h,
        ),
        exampleSection({ title: 'In a card', isBare: true, children: [inACard(model, h)] }, h),
      ],
    },
    h,
  ),
);

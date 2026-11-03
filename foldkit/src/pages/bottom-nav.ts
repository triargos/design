import { Array, Duration, Effect, Option, Schema } from 'effect';
import { Command, Submodel, Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import { cn } from '../pavo/cn.ts';
import type { PageContext } from '../pageContext.ts';
import * as ActionBar from '../pavo/action-bar.ts';
import * as Badge from '../pavo/badge.ts';
import * as BottomNav from '../pavo/bottom-nav.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import * as Checkbox from '../pavo/checkbox.ts';
import * as Field from '../pavo/field.ts';
import { icon } from '../pavo/icon.ts';
import * as Input from '../pavo/input.ts';
import * as Item from '../pavo/item.ts';
import type { PartAttribute } from '../pavo/part.ts';
import * as Separator from '../pavo/separator.ts';
import * as Switch from '../pavo/switch.ts';

export const title = 'Bottom Nav';
export const description =
  'The app navigation on a phone: a floating bar of icon tabs and the main action, on the inverted surface.';

const NavExample = Schema.Literals(['Default', 'Labels', 'Selection', 'Stacked']);
type NavExample = typeof NavExample.Type;

const SelectionExample = Schema.Literals(['Selection', 'Stacked']);
type SelectionExample = typeof SelectionExample.Type;

const StackedBar = Schema.Literals(['Selection', 'Unsaved']);
type StackedBar = typeof StackedBar.Type;

type Tab = Readonly<{ label: string; icon: Html; count?: number }>;

type Task = Readonly<{ id: string; title: string; project?: string }>;

const SAVED_STATUS_DURATION = Duration.millis(1200);

const DEFAULT_TABS: ReadonlyArray<Tab> = [
  { label: 'Home', icon: icon('home') },
  { label: 'Inbox', icon: icon('inbox'), count: 3 },
  { label: 'Tasks', icon: icon('square-check') },
];

const LABELS_TABS: ReadonlyArray<Tab> = [
  { label: 'Inbox', icon: icon('mail'), count: 2 },
  { label: 'Family', icon: icon('id') },
  { label: 'Documents', icon: icon('folder') },
];

const SELECTION_TABS: ReadonlyArray<Tab> = [
  { label: 'Home', icon: icon('home') },
  { label: 'Inbox', icon: icon('inbox') },
  { label: 'Tasks', icon: icon('square-check') },
  { label: 'Settings', icon: icon('settings') },
];

const STACKED_TABS: ReadonlyArray<Tab> = [
  { label: 'Home', icon: icon('home') },
  { label: 'Inbox', icon: icon('inbox') },
  { label: 'Tasks', icon: icon('square-check') },
];

const SELECTION_TASKS: ReadonlyArray<Task> = [
  { id: '1', title: 'Update pricing page', project: 'Website redesign' },
  { id: '2', title: 'Write launch post', project: 'Website redesign' },
  { id: '3', title: 'Fix login redirect', project: 'Mobile app' },
  { id: '4', title: 'Send onboarding emails', project: 'Mobile app' },
  { id: '5', title: 'Review analytics events', project: 'Mobile app' },
];

const STACKED_TASKS: ReadonlyArray<Task> = [
  { id: '1', title: 'Update pricing page' },
  { id: '2', title: 'Write launch post' },
  { id: '3', title: 'Fix login redirect' },
];

const NavModels = Schema.Struct({
  Default: BottomNav.Model,
  Labels: BottomNav.Model,
  Selection: BottomNav.Model,
  Stacked: BottomNav.Model,
});

const CurrentPages = Schema.Struct({
  Default: Schema.String,
  Labels: Schema.String,
  Selection: Schema.String,
  Stacked: Schema.String,
});

const Selection = Schema.Struct({ taskIds: Schema.Array(Schema.String), lastCount: Schema.Number });
type Selection = typeof Selection.Type;

export const Model = Schema.Struct({
  navs: NavModels,
  currentPages: CurrentPages,
  selections: Schema.Struct({ Selection, Stacked: Selection }),
  isPill: Schema.Boolean,
  savedName: Schema.String,
  name: Schema.String,
  isJustSaved: Schema.Boolean,
  maybeDockedStackedBar: Schema.Option(StackedBar),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedTab: { example: NavExample, label: Schema.String },
  GotNavMessage: { example: NavExample, message: BottomNav.Message },
  ToggledTask: { example: SelectionExample, taskId: Schema.String, isChecked: Schema.Boolean },
  ClickedClearSelection: { example: SelectionExample },
  UpdatedName: { value: Schema.String },
  ToggledPill: { isChecked: Schema.Boolean },
  ClickedDiscard: {},
  ClickedSave: {},
  CompletedWaitAfterSave: {},
});
export type Message = typeof Message.Type;

const WaitAfterSave = Command.define('WaitAfterSave', {
  messages: [Message.CompletedWaitAfterSave],
  execute: Effect.sleep(SAVED_STATUS_DURATION).pipe(Effect.as(Message.CompletedWaitAfterSave())),
});

const EMPTY_SELECTION: Selection = { taskIds: [], lastCount: 0 };

const INITIAL_NAME = 'Website redesign';

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    navs: {
      Default: BottomNav.init({ id: 'bottom-nav-default' }),
      Labels: BottomNav.init({ id: 'bottom-nav-labels' }),
      Selection: BottomNav.init({ id: 'bottom-nav-selection' }),
      Stacked: BottomNav.init({ id: 'bottom-nav-stacked' }),
    },
    currentPages: { Default: 'Tasks', Labels: 'Inbox', Selection: 'Tasks', Stacked: 'Tasks' },
    selections: { Selection: EMPTY_SELECTION, Stacked: EMPTY_SELECTION },
    isPill: true,
    savedName: INITIAL_NAME,
    name: INITIAL_NAME,
    isJustSaved: false,
    maybeDockedStackedBar: Option.none(),
  },
});

const toNavMessage =
  (example: NavExample) =>
  (message: BottomNav.Message): Message =>
    Message.GotNavMessage({ example, message });

const withCurrentPage = (model: Model, example: NavExample, label: string): Model =>
  modifyFields(model, { currentPages: (currentPages) => ({ ...currentPages, [example]: label }) });

const foldNavOutMessage = (example: NavExample) =>
  BottomNav.OutMessage.match<Update.Step<Model, Message>>({
    ChoseMoreItem:
      ({ itemId }) =>
      (stepModel) => ({ model: withCurrentPage(stepModel, example, itemId) }),
  });

const foldNav = Update.foldChildAt({
  update: BottomNav.update,
  readAt: (model: Model, example: NavExample) => Option.some(model.navs[example]),
  writeAt: (model: Model, example: NavExample, nextNav: BottomNav.Model) =>
    modifyFields(model, { navs: (navs) => ({ ...navs, [example]: nextNav }) }),
  toParentMessage: (example: NavExample, message: BottomNav.Message) => Message.GotNavMessage({ example, message }),
  foldOutMessage: foldNavOutMessage,
});

const isDirty = (model: Model): boolean => model.name !== model.savedName;

const stackedBars = (model: Model): ReadonlyArray<ActionBar.OpenBar> => [
  { id: 'Selection', priority: 0, isOpen: Array.isReadonlyArrayNonEmpty(model.selections.Stacked.taskIds) },
  { id: 'Unsaved', priority: 1, isOpen: isDirty(model) || model.isJustSaved },
];

const toStackedBar = (id: string): Option.Option<StackedBar> => Schema.decodeUnknownOption(StackedBar)(id);

const rememberDockedBar = (model: Model): Model =>
  Option.match(Option.flatMap(ActionBar.topmost(stackedBars(model)), toStackedBar), {
    onNone: () => model,
    onSome: (bar) => modifyFields(model, { maybeDockedStackedBar: () => Option.some(bar) }),
  });

const updateSelection = (
  model: Model,
  example: SelectionExample,
  toTaskIds: (taskIds: ReadonlyArray<string>) => ReadonlyArray<string>,
): Model =>
  modifyFields(model, {
    selections: (selections) => {
      const taskIds = toTaskIds(selections[example].taskIds);
      return {
        ...selections,
        [example]: {
          taskIds,
          lastCount: Array.isReadonlyArrayNonEmpty(taskIds) ? taskIds.length : selections[example].lastCount,
        },
      };
    },
  });

const toggleTask =
  (taskId: string, isChecked: boolean) =>
  (taskIds: ReadonlyArray<string>): ReadonlyArray<string> =>
    isChecked ? Array.dedupe(Array.append(taskIds, taskId)) : Array.filter(taskIds, (id) => id !== taskId);

const updateMessage = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedTab: ({ example, label }) => ({ model: withCurrentPage(model, example, label) }),
    GotNavMessage: ({ example, message }) => foldNav(model, example, message),
    ToggledTask: ({ example, taskId, isChecked }) => ({
      model: updateSelection(model, example, toggleTask(taskId, isChecked)),
    }),
    ClickedClearSelection: ({ example }) => ({ model: updateSelection(model, example, () => []) }),
    UpdatedName: ({ value }) => ({ model: modifyFields(model, { name: () => value }) }),
    ToggledPill: ({ isChecked }) => ({ model: modifyFields(model, { isPill: () => isChecked }) }),
    ClickedDiscard: () => ({ model: modifyFields(model, { name: () => model.savedName }) }),
    ClickedSave: () => ({
      model: modifyFields(model, { savedName: () => model.name, isJustSaved: () => true }),
      commands: [WaitAfterSave()],
    }),
    CompletedWaitAfterSave: () => ({ model: modifyFields(model, { isJustSaved: () => false }) }),
  });

export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  const messageUpdate = updateMessage(model, message);
  return { ...messageUpdate, model: rememberDockedBar(messageUpdate.model) };
};

const navSubscriptions = (example: NavExample) =>
  Subscription.lift({
    [`bottomNav${example}PanelDismissal`]: BottomNav.subscriptions.panelDismissal,
  })<Model, Message>({
    read: (model) => Option.some(model.navs[example]),
    toParentMessage: toNavMessage(example),
  });

export const subscriptions = Subscription.aggregate(
  navSubscriptions('Default'),
  navSubscriptions('Labels'),
  navSubscriptions('Stacked'),
);

const tabLink = (example: NavExample, currentPage: string, tab: Tab, h: HtmlBuilder<Message>): Html =>
  BottomNav.link(
    {
      href: '#',
      isCurrent: currentPage === tab.label,
      onClick: Message.ClickedTab({ example, label: tab.label }),
      attributes: [h.Key(tab.label)],
      children: [
        tab.icon,
        h.span([], [tab.label]),
        ...(tab.count === undefined
          ? []
          : [
              Badge.view(
                { size: 'sm', shape: 'pill', intent: 'primary', emphasis: 'solid', children: [String(tab.count)] },
                h,
              ),
            ]),
      ],
    },
    h,
  );

const moreItem = (currentPage: string, label: string, itemIcon: Html): BottomNav.MoreEntry<Message> =>
  BottomNav.moreItem({ id: label, label, icon: itemIcon, href: '#', isCurrent: currentPage === label });

const stage = (
  className: string,
  attributes: ReadonlyArray<PartAttribute<Message>>,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Class(
        cn('relative h-[640px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50', className),
      ),
      ...attributes,
    ],
    children,
  );

const placeholderCard = (cardTitle: string, contentClassName: string, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      attributes: [h.Key(cardTitle)],
      children: [
        Card.header({ children: [Card.title({ children: [cardTitle] }, h)] }, h),
        Card.content({ className: contentClassName }, h),
      ],
    },
    h,
  );

const defaultExample = (model: Model, h: HtmlBuilder<Message>): Html => {
  const currentPage = model.currentPages.Default;
  const nav = model.navs.Default;
  return stage(
    'w-[375px]',
    [],
    [
      h.div(
        [h.Class('h-full overflow-y-auto px-5 pt-10 pb-24')],
        [
          h.div(
            [h.Class('flex flex-col gap-page')],
            [
              h.h1([h.Class('text-title text-balance')], [currentPage]),
              ...Array.map(['Due today', 'This week', 'Later'], (cardTitle) => placeholderCard(cardTitle, 'h-24', h)),
            ],
          ),
        ],
      ),
      BottomNav.view(
        {
          className: 'absolute md:grid',
          children: [
            BottomNav.list(
              {
                model: nav,
                toParentMessage: toNavMessage('Default'),
                more: {
                  entries: [
                    moreItem(currentPage, 'Calendar', icon('calendar')),
                    moreItem(currentPage, 'Projects', icon('folder')),
                    moreItem(currentPage, 'Members', icon('users')),
                    BottomNav.moreGroup({
                      id: 'Settings',
                      label: 'Settings',
                      icon: icon('settings'),
                      entries: [
                        moreItem(currentPage, 'Profile', icon('user')),
                        moreItem(currentPage, 'Notifications', icon('bell')),
                        BottomNav.moreGroup({
                          id: 'Appearance',
                          label: 'Appearance',
                          icon: icon('palette'),
                          entries: [
                            moreItem(currentPage, 'Theme', icon('sun')),
                            moreItem(currentPage, 'Language', icon('language')),
                          ],
                        }),
                      ],
                    }),
                  ],
                },
                children: Array.map(DEFAULT_TABS, (tab) => tabLink('Default', currentPage, tab, h)),
              },
              h,
            ),
            BottomNav.action(
              { isAway: BottomNav.isAway(nav, false), ariaLabel: 'New task', children: [icon('plus')] },
              h,
            ),
          ],
        },
        h,
      ),
    ],
    h,
  );
};

const labelsExample = (model: Model, h: HtmlBuilder<Message>): Html => {
  const currentPage = model.currentPages.Labels;
  return stage(
    'w-[390px]',
    [],
    [
      h.div(
        [h.Class('h-full overflow-y-auto px-4 pt-6 pb-36')],
        [
          h.div(
            [h.Class('flex flex-col gap-6')],
            [
              h.h1([h.Class('px-tight text-title text-balance')], [currentPage]),
              ...Array.map(['Messages', 'Earlier'], (cardTitle) => placeholderCard(cardTitle, 'h-32', h)),
            ],
          ),
        ],
      ),
      BottomNav.view(
        {
          className: 'absolute md:grid',
          children: [
            BottomNav.list(
              {
                model: model.navs.Labels,
                toParentMessage: toNavMessage('Labels'),
                isLabeled: true,
                isFill: true,
                more: {
                  entries: [
                    moreItem(currentPage, 'Announcements', icon('speakerphone')),
                    moreItem(currentPage, 'Absences', icon('calendar-off')),
                    BottomNav.moreGroup({
                      id: 'School',
                      label: 'School',
                      icon: icon('school'),
                      entries: [
                        moreItem(currentPage, 'Timetable', icon('clock')),
                        moreItem(currentPage, 'Teachers', icon('users')),
                      ],
                    }),
                  ],
                },
                children: Array.map(LABELS_TABS, (tab) => tabLink('Labels', currentPage, tab, h)),
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
    h,
  );
};

const taskList = (
  example: SelectionExample,
  tasks: ReadonlyArray<Task>,
  selection: Selection,
  h: HtmlBuilder<Message>,
): Html =>
  Card.view(
    {
      children: [
        Card.content(
          {
            className: 'overflow-hidden',
            children: [
              Item.list(
                {
                  ariaLabel: 'Tasks',
                  children: Array.map(tasks, (task) => {
                    const isSelected = Array.contains(selection.taskIds, task.id);
                    return Item.view(
                      {
                        isSelected,
                        attributes: [h.Key(task.id)],
                        children: [
                          Item.media(
                            {
                              children: [
                                Checkbox.view(
                                  {
                                    id: `bottom-nav-${example}-task-${task.id}`,
                                    ariaLabel: task.title,
                                    isChecked: isSelected,
                                    onToggle: (isChecked) =>
                                      Message.ToggledTask({ example, taskId: task.id, isChecked }),
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Item.content(
                            {
                              children: [
                                Item.title({ children: [task.title] }, h),
                                ...(task.project === undefined
                                  ? []
                                  : [Item.description({ children: [task.project] }, h)]),
                              ],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    );
                  }),
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

const selectionCount = (selection: Selection, h: HtmlBuilder<Message>): Html =>
  h.span([h.Class('ps-2.5 whitespace-nowrap text-muted-foreground tabular-nums')], [`${selection.lastCount} selected`]);

const clearButton = (example: SelectionExample, h: HtmlBuilder<Message>): Html =>
  Button.view(
    {
      emphasis: 'ghost',
      size: 'icon',
      ariaLabel: 'Clear selection',
      onClick: Message.ClickedClearSelection({ example }),
      children: [icon('x')],
    },
    h,
  );

const deleteButton = (example: SelectionExample, h: HtmlBuilder<Message>): Html =>
  Button.view(
    {
      intent: 'destructive',
      emphasis: 'subtle',
      size: 'icon',
      ariaLabel: 'Delete',
      onClick: Message.ClickedClearSelection({ example }),
      children: [icon('trash')],
    },
    h,
  );

const withSelectionExample = (model: Model, h: HtmlBuilder<Message>): Html => {
  const currentPage = model.currentPages.Selection;
  const nav = model.navs.Selection;
  const selection = model.selections.Selection;
  const isSelecting = Array.isReadonlyArrayNonEmpty(selection.taskIds);
  const selectionBar = ActionBar.view(
    {
      isOpen: isSelecting,
      isDocked: true,
      ariaLabel: 'Selection',
      children: [
        selectionCount(selection, h),
        clearButton('Selection', h),
        Separator.view({ orientation: 'vertical', className: 'my-1.5' }, h),
        Button.view({ size: 'icon', ariaLabel: 'Export', children: [icon('download')] }, h),
        deleteButton('Selection', h),
      ],
    },
    h,
  );

  return stage(
    'w-[375px]',
    [],
    [
      h.div(
        [h.Class('flex h-full flex-col gap-page overflow-y-auto px-5 pt-10 pb-24')],
        [h.h1([h.Class('text-title text-balance')], ['Tasks']), taskList('Selection', SELECTION_TASKS, selection, h)],
      ),
      BottomNav.view(
        {
          className: 'absolute md:grid',
          children: [
            BottomNav.list(
              {
                model: nav,
                toParentMessage: toNavMessage('Selection'),
                dock: { isShown: isSelecting, content: selectionBar },
                children: Array.map(SELECTION_TABS, (tab) => tabLink('Selection', currentPage, tab, h)),
              },
              h,
            ),
            BottomNav.action(
              { isAway: BottomNav.isAway(nav, isSelecting), ariaLabel: 'New task', children: [icon('plus')] },
              h,
            ),
          ],
        },
        h,
      ),
    ],
    h,
  );
};

const stackedSelectionBar = (model: Model, h: HtmlBuilder<Message>): Html =>
  ActionBar.view(
    {
      isOpen: Array.isReadonlyArrayNonEmpty(model.selections.Stacked.taskIds),
      isDocked: true,
      ariaLabel: 'Selection',
      children: [
        selectionCount(model.selections.Stacked, h),
        clearButton('Stacked', h),
        Separator.view({ orientation: 'vertical', className: 'my-1.5' }, h),
        deleteButton('Stacked', h),
      ],
    },
    h,
  );

const unsavedBar = (model: Model, h: HtmlBuilder<Message>): Html =>
  ActionBar.view(
    {
      isOpen: isDirty(model) || model.isJustSaved,
      isDocked: true,
      ariaLabel: 'Unsaved changes',
      ...(model.isJustSaved ? { status: [icon('check', { className: 'text-success' }), 'Saved'] } : {}),
      children: [
        h.span([h.Class('ps-2.5 whitespace-nowrap text-muted-foreground')], ['Unsaved changes']),
        Button.view({ emphasis: 'ghost', onClick: Message.ClickedDiscard(), children: ['Discard'] }, h),
        Button.view({ onClick: Message.ClickedSave(), children: ['Save'] }, h),
      ],
    },
    h,
  );

const stackedDock = (model: Model, h: HtmlBuilder<Message>): BottomNav.Dock | undefined =>
  Option.match(model.maybeDockedStackedBar, {
    onNone: () => undefined,
    onSome: (bar) => ({
      isShown: Option.isSome(ActionBar.topmost(stackedBars(model))),
      content: h.keyed('div')(
        bar,
        [h.Class('contents')],
        [bar === 'Selection' ? stackedSelectionBar(model, h) : unsavedBar(model, h)],
      ),
    }),
  });

const stackedMore = (currentPage: string): BottomNav.MoreConfig<Message> => ({
  entries: [
    BottomNav.moreGroup({
      id: 'Projects',
      label: 'Projects',
      icon: icon('folder'),
      entries: [
        moreItem(currentPage, 'Website redesign', icon('briefcase')),
        moreItem(currentPage, 'Mobile app', icon('briefcase')),
        moreItem(currentPage, 'Ideas', icon('bulb')),
      ],
    }),
    BottomNav.moreGroup({
      id: 'Settings',
      label: 'Settings',
      icon: icon('settings'),
      entries: [
        moreItem(currentPage, 'Profile', icon('user')),
        BottomNav.moreGroup({
          id: 'Appearance',
          label: 'Appearance',
          icon: icon('palette'),
          entries: [moreItem(currentPage, 'Theme', icon('sun')), moreItem(currentPage, 'Text size', icon('text-size'))],
        }),
        moreItem(currentPage, 'Invite a friend', icon('mail')),
      ],
    }),
  ],
});

const stackedExample = (model: Model, h: HtmlBuilder<Message>): Html => {
  const currentPage = model.currentPages.Stacked;
  return stage(
    'w-[375px]',
    model.isPill ? [h.Style({ '--bottom-nav-radius': '9999px' })] : [],
    [
      h.div(
        [h.Class('flex h-full flex-col gap-page overflow-y-auto px-5 pt-10 pb-24')],
        [
          h.h1([h.Class('text-title text-balance')], ['Project']),
          Field.view(
            {
              children: [
                Field.label({ forId: 'stacked-bars-name', children: ['Name'] }, h),
                Input.view(
                  {
                    id: 'stacked-bars-name',
                    value: model.name,
                    onInput: (value) => Message.UpdatedName({ value }),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          Field.view(
            {
              orientation: 'horizontal',
              children: [
                Field.label({ forId: 'stacked-bars-pill', children: ['Pill bar'] }, h),
                Switch.view(
                  {
                    id: 'stacked-bars-pill',
                    isChecked: model.isPill,
                    onToggle: (isChecked) => Message.ToggledPill({ isChecked }),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          taskList('Stacked', STACKED_TASKS, model.selections.Stacked, h),
        ],
      ),
      BottomNav.view(
        {
          className: 'absolute md:grid',
          children: [
            BottomNav.list(
              {
                model: model.navs.Stacked,
                toParentMessage: toNavMessage('Stacked'),
                more: stackedMore(currentPage),
                dock: stackedDock(model, h),
                children: Array.map(STACKED_TABS, (tab) => tabLink('Stacked', currentPage, tab, h)),
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
    h,
  );
};

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'The app navigation on a phone: a floating bar of 3–5 icon tabs and the main action beside it, dark on a light page and light on a dark one. Hidden from md up, where the Sidebar takes over.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [
              code('BottomNav.list', h),
              ' holds a ',
              code('BottomNav.link({ isCurrent })', h),
              ' per page and ',
              code('more', h),
              ', which morphs the bar into a list of the rest, one ',
              code('BottomNav.moreItem', h),
              ' per link. A ',
              code('BottomNav.moreGroup', h),
              ' opens a page of its own under a Back row, nested as deep as needed (Settings, then Appearance): the bar springs to each page’s height, rows come in from the side they go. ',
              code('BottomNav.action', h),
              ' is the main action. Labels are for screen readers; a count is a ',
              code('Badge', h),
              ' in the tab. Open "More".',
            ],
            isBare: true,
            children: [defaultExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Labels',
            description: [
              code('isLabeled', h),
              ': the label under each icon (',
              code('--bottom-nav-tab-width', h),
              ' × ',
              code('--bottom-nav-tab-height', h),
              ') and a fill that springs to the tab (',
              code('duration-indicator ease-spring-bounce', h),
              '). Tabs shrink to fit four or five on a phone. ',
              code('isFill', h),
              ' spans the bar across the nav, in line with the page’s content, the tabs sharing it evenly. The page keeps ',
              code('pb-36', h),
              '.',
            ],
            isBare: true,
            children: [labelsExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With selection',
            description: [
              'A page’s open ',
              code('ActionBar', h),
              ' docks in the nav (',
              code('dock', h),
              '): the bar springs to the toolbar’s size and its actions rise in; clearing morphs it back. Select a task.',
            ],
            isBare: true,
            children: [withSelectionExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Stacked bars and radius',
            description: [
              'Several ',
              code('ActionBar', h),
              's may be open; one docks: the highest ',
              code('priority', h),
              ' (',
              code('ActionBar.topmost', h),
              '). The next takes its place when it closes. ',
              code('--bottom-nav-radius', h),
              ' sets the bar’s corner, capped at half its height, so ',
              code('9999px', h),
              ' makes a pill ("Pill bar"); off, it takes the Customize radius preset. The tabs, the panel’s rows and a docked bar’s buttons follow, concentric. Rename the project, then select a task.',
            ],
            isBare: true,
            children: [stackedExample(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

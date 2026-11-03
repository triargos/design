import { Array, Option, Record, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as DropdownMenu from '../pavo/dropdown-menu.ts';
import { icon } from '../pavo/icon.ts';

export const title = 'Dropdown Menu';
export const description = 'A list of actions opened from a button.';

const MenuKey = Schema.Literals(['Default', 'Shortcuts', 'Checkbox', 'Radio', 'Submenu', 'Destructive']);
type MenuKey = typeof MenuKey.Type;

const Column = Schema.Literals(['Assignee', 'Status', 'Due date']);
type Column = typeof Column.Type;
const COLUMNS = Column.literals;

const Sort = Schema.Literals(['Newest first', 'Oldest first', 'Name']);
type Sort = typeof Sort.Type;
const SORTS = Sort.literals;

const STATUSES = ['To do', 'In progress', 'Done'];

const ACTION_ICONS: Readonly<Record<string, Html>> = {
  Edit: icon('pencil'),
  Duplicate: icon('copy'),
  Archive: icon('archive'),
  Print: icon('printer'),
  Delete: icon('trash'),
};

const actionChildren = (item: string): ReadonlyArray<Html | string> => [
  ...Option.toArray(Option.fromNullishOr(ACTION_ICONS[item])),
  item,
];

export const Model = Schema.Struct({
  menus: Schema.Record(MenuKey, DropdownMenu.Model),
  visibleColumns: Schema.Array(Column),
  sort: Sort,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotMenuMessage: { menuId: MenuKey, message: DropdownMenu.Message },
});
export type Message = typeof Message.Type;

const ActionMenu = DropdownMenu.create<string>();

const initMenu = (key: MenuKey): DropdownMenu.Model =>
  DropdownMenu.init({ id: `dropdown-menu-${key}`, isAnimated: true, isModal: true });

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    menus: {
      Default: initMenu('Default'),
      Shortcuts: initMenu('Shortcuts'),
      Checkbox: initMenu('Checkbox'),
      Radio: initMenu('Radio'),
      Submenu: initMenu('Submenu'),
      Destructive: initMenu('Destructive'),
    },
    visibleColumns: ['Assignee', 'Status'],
    sort: 'Newest first',
  },
});

const toMenuMessage = (key: MenuKey, message: DropdownMenu.Message): Message =>
  Message.GotMenuMessage({ menuId: key, message });

const toggleColumn = (column: string) => (columns: ReadonlyArray<Column>) =>
  Array.some(columns, (visible) => visible === column)
    ? Array.filter(columns, (visible) => visible !== column)
    : Array.filter(COLUMNS, (candidate) => candidate === column || Array.contains(columns, candidate));

const foldMenuOutMessage = (key: MenuKey) =>
  DropdownMenu.OutMessage.match<Update.Step<Model, Message>>({
    Selected:
      ({ value }) =>
      (stepModel) => {
        if (key === 'Checkbox') {
          return { model: modifyFields(stepModel, { visibleColumns: toggleColumn(value) }) };
        } else if (key === 'Radio') {
          return {
            model: modifyFields(stepModel, {
              sort: (sort) =>
                Option.getOrElse(
                  Array.findFirst(SORTS, (candidate) => candidate === value),
                  () => sort,
                ),
            }),
          };
        } else {
          return { model: stepModel };
        }
      },
  });

const foldMenu = Update.foldChildAt({
  update: ActionMenu.update,
  readAt: (model: Model, key: MenuKey) => Option.some(model.menus[key]),
  writeAt: (model: Model, key: MenuKey, nextMenu: DropdownMenu.Model) =>
    modifyFields(model, { menus: Record.set(key, nextMenu) }),
  toParentMessage: toMenuMessage,
  foldOutMessage: foldMenuOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotMenuMessage: ({ menuId: key, message }) => foldMenu(model, key, message),
  });

type MenuConfig = Omit<DropdownMenu.ViewConfig<string, Message>, 'model' | 'toParentMessage'>;

const menu = (model: Model, key: MenuKey, config: MenuConfig, h: HtmlBuilder<Message>): Html =>
  ActionMenu.view({ model: model.menus[key], toParentMessage: (message) => toMenuMessage(key, message), ...config }, h);

const actionsTrigger: DropdownMenu.TriggerConfig = { size: 'icon', ariaLabel: 'Actions', children: [icon('dots')] };

const defaultMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Default',
    {
      trigger: actionsTrigger,
      align: 'start',
      className: 'w-56',
      items: ['Edit', 'Duplicate', 'Archive'],
      isItemDisabled: (item) => item === 'Archive',
      itemGroupKey: () => 'Project',
      groupToLabel: () => 'Website redesign',
      itemToConfig: (item) => ({ children: actionChildren(item) }),
    },
    h,
  );

const SHORTCUTS: Record<string, string> = { Edit: 'E', Duplicate: '⌘D', Print: '⌘P' };

const shortcutsMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Shortcuts',
    {
      trigger: actionsTrigger,
      align: 'start',
      className: 'w-56',
      items: ['Edit', 'Duplicate', 'Print'],
      itemToConfig: (item) => ({
        children: [...actionChildren(item), DropdownMenu.shortcut({ children: [SHORTCUTS[item] ?? ''] }, h)],
      }),
    },
    h,
  );

const checkboxMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Checkbox',
    {
      trigger: { children: [icon('adjustments-horizontal', { dataIcon: 'inline-start' }), 'Columns'] },
      align: 'start',
      className: 'w-52',
      items: COLUMNS,
      itemGroupKey: () => 'Columns',
      groupToLabel: () => 'Visible columns',
      itemToConfig: (item) => ({
        kind: 'Checkbox',
        isChecked: Array.some(model.visibleColumns, (column) => column === item),
        children: [item],
      }),
    },
    h,
  );

const radioMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Radio',
    {
      trigger: { children: [icon('arrows-sort', { dataIcon: 'inline-start' }), 'Sort'] },
      align: 'start',
      className: 'w-52',
      items: SORTS,
      itemGroupKey: () => 'Sort',
      groupToLabel: () => 'Sort by',
      itemToConfig: (item) => ({ kind: 'Radio', isChecked: model.sort === item, children: [item] }),
    },
    h,
  );

const submenuMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Submenu',
    {
      trigger: actionsTrigger,
      align: 'start',
      className: 'w-52',
      items: ['Edit', ...STATUSES],
      itemGroupKey: (item) => (item === 'Edit' ? 'Actions' : 'Status'),
      groupToLabel: (groupKey) => (groupKey === 'Status' ? 'Change status' : undefined),
      itemToConfig: (item) => ({ children: actionChildren(item) }),
    },
    h,
  );

const destructiveMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Destructive',
    {
      trigger: actionsTrigger,
      align: 'start',
      className: 'w-52',
      items: ['Edit', 'Duplicate', 'Delete'],
      itemGroupKey: (item) => (item === 'Delete' ? 'Danger' : 'Actions'),
      itemToConfig: (item) => ({
        intent: item === 'Delete' ? 'destructive' : 'neutral',
        children: actionChildren(item),
      }),
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A list of actions opened from a button: an icon, a label, a shortcut. A destructive item takes intent="destructive" and sits last. To open a dialog from an item, see Dialog › Opened from a menu.',
      sections: [
        exampleSection({ title: 'Default', children: [defaultMenu(model, h)] }, h),
        exampleSection(
          { title: 'Shortcuts', description: [code('DropdownMenu.shortcut', h)], children: [shortcutsMenu(model, h)] },
          h,
        ),
        exampleSection(
          { title: 'Checkbox', description: 'Toggles in the menu, controlled.', children: [checkboxMenu(model, h)] },
          h,
        ),
        exampleSection(
          { title: 'Radio group', description: 'One of a few, chosen in the menu.', children: [radioMenu(model, h)] },
          h,
        ),
        exampleSection(
          {
            title: 'Submenu',
            description:
              '@foldkit/ui Menu has no submenu: the second list is a labelled group in the first, separated by a rule.',
            children: [submenuMenu(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Destructive item',
            description: [code("intent: 'destructive'", h), ', last, after a separator.'],
            children: [destructiveMenu(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

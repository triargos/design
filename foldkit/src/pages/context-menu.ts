import { Array, Option, Record, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as ContextMenu from '../pavo/context-menu.ts';
import { icon } from '../pavo/icon.ts';

export const title = 'Context Menu';
export const description = 'A menu opened with a right click where the pointer is.';

const MenuKey = Schema.Literals(['Default', 'Grouped', 'Submenu', 'Checkbox', 'Radio', 'Destructive']);
type MenuKey = typeof MenuKey.Type;

const Audience = Schema.Literals(['Members', 'Guests']);
type Audience = typeof Audience.Type;
const AUDIENCES = Audience.literals;

const FileView = Schema.Literals(['List', 'Grid']);
type FileView = typeof FileView.Type;
const FILE_VIEWS = FileView.literals;

export const Model = Schema.Struct({
  menus: Schema.Record(MenuKey, ContextMenu.Model),
  visibleTo: Schema.Array(Audience),
  fileView: FileView,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotMenuMessage: { key: MenuKey, message: ContextMenu.Message },
});
export type Message = typeof Message.Type;

const initMenu = (key: MenuKey): ContextMenu.Model => ContextMenu.init({ id: `context-menu-${key}` });

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    menus: {
      Default: initMenu('Default'),
      Grouped: initMenu('Grouped'),
      Submenu: initMenu('Submenu'),
      Checkbox: initMenu('Checkbox'),
      Radio: initMenu('Radio'),
      Destructive: initMenu('Destructive'),
    },
    visibleTo: ['Members'],
    fileView: 'List',
  },
});

const toMenuMessage = (key: MenuKey, message: ContextMenu.Message): Message => Message.GotMenuMessage({ key, message });

const toggleAudience = (value: string) => (audiences: ReadonlyArray<Audience>) =>
  Array.filter(AUDIENCES, (audience) =>
    audience === value ? !Array.contains(audiences, audience) : Array.contains(audiences, audience),
  );

const foldMenuOutMessage = (key: MenuKey) =>
  ContextMenu.OutMessage.match<Update.Step<Model, Message>>({
    Selected:
      ({ value }) =>
      (stepModel) => {
        if (key === 'Checkbox') {
          return { model: modifyFields(stepModel, { visibleTo: toggleAudience(value) }) };
        } else if (key === 'Radio') {
          return {
            model: modifyFields(stepModel, {
              fileView: (fileView) =>
                Option.getOrElse(
                  Array.findFirst(FILE_VIEWS, (candidate) => candidate === value),
                  () => fileView,
                ),
            }),
          };
        } else {
          return { model: stepModel };
        }
      },
  });

const foldMenu = Update.foldChildAt({
  update: ContextMenu.update,
  readAt: (model: Model, key: MenuKey) => Option.some(model.menus[key]),
  writeAt: (model: Model, key: MenuKey, nextMenu: ContextMenu.Model) =>
    modifyFields(model, { menus: Record.set(key, nextMenu) }),
  toParentMessage: toMenuMessage,
  foldOutMessage: foldMenuOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotMenuMessage: ({ key, message }) => foldMenu(model, key, message),
  });

const ICONS: Readonly<Record<string, Html>> = {
  Rename: icon('pencil'),
  'Copy link': icon('copy'),
  Download: icon('download'),
  'Share with the team': icon('share-2'),
  Delete: icon('trash'),
};

const itemChildren = (item: string): ReadonlyArray<Html | string> => [
  ...Option.toArray(Option.fromNullishOr(ICONS[item])),
  item,
];

type MenuConfig = Omit<ContextMenu.ViewConfig<Message>, 'model' | 'toParentMessage' | 'trigger'>;

const menu = (model: Model, key: MenuKey, config: MenuConfig, h: HtmlBuilder<Message>): Html =>
  ContextMenu.view(
    {
      model: model.menus[key],
      toParentMessage: (message) => toMenuMessage(key, message),
      trigger: {
        className:
          'flex h-40 w-72 items-center justify-center rounded-control-lg border border-dashed border-border text-body text-muted-foreground',
        children: ['Right-click the file'],
      },
      className: 'w-52',
      ...config,
    },
    h,
  );

const defaultMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Default',
    {
      items: ['Rename', 'Copy link'],
      itemToConfig: (item) => ({
        children: [
          ...itemChildren(item),
          ...(item === 'Rename' ? [ContextMenu.shortcut({ children: ['F2'] }, h)] : []),
        ],
      }),
    },
    h,
  );

const groupedMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Grouped',
    {
      items: ['Rename', 'Download', 'Copy link', 'Share with the team'],
      itemGroupKey: (item) => (item === 'Rename' || item === 'Download' ? 'File' : 'Share'),
      groupToLabel: (groupKey) => groupKey,
      itemToConfig: (item) => ({ children: itemChildren(item) }),
    },
    h,
  );

const submenuMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Submenu',
    {
      items: ['Rename', 'Contracts', 'Invoices', 'Archive'],
      itemGroupKey: (item) => (item === 'Rename' ? 'Actions' : 'Move to'),
      groupToLabel: (groupKey) => (groupKey === 'Move to' ? groupKey : undefined),
      itemToConfig: (item) => ({ children: itemChildren(item) }),
    },
    h,
  );

const checkboxMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Checkbox',
    {
      items: AUDIENCES,
      itemGroupKey: () => 'Visible to',
      groupToLabel: (groupKey) => groupKey,
      itemToConfig: (item) => ({
        kind: 'Checkbox',
        isChecked: Array.some(model.visibleTo, (audience) => audience === item),
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
      items: FILE_VIEWS,
      itemGroupKey: () => 'View',
      groupToLabel: (groupKey) => groupKey,
      itemToConfig: (item) => ({ kind: 'Radio', isChecked: model.fileView === item, children: [item] }),
    },
    h,
  );

const destructiveMenu = (model: Model, h: HtmlBuilder<Message>): Html =>
  menu(
    model,
    'Destructive',
    {
      items: ['Rename', 'Delete'],
      itemGroupKey: (item) => (item === 'Delete' ? 'Danger' : 'Actions'),
      itemToConfig: (item) => ({
        intent: item === 'Delete' ? 'destructive' : 'neutral',
        children: itemChildren(item),
      }),
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'The dropdown menu, opened with a right click where the pointer is. Only ever a shortcut: every action is reachable another way.',
      sections: [
        exampleSection(
          { title: 'Default', description: 'Right-click the area.', children: [defaultMenu(model, h)] },
          h,
        ),
        exampleSection(
          {
            title: 'Grouped',
            description: [code('itemGroupKey · groupToLabel', h)],
            children: [groupedMenu(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Submenu',
            description: '@foldkit/ui Menu has no submenu: “Move to” is a labelled group.',
            children: [submenuMenu(model, h)],
          },
          h,
        ),
        exampleSection({ title: 'Checkbox', children: [checkboxMenu(model, h)] }, h),
        exampleSection({ title: 'Radio group', children: [radioMenu(model, h)] }, h),
        exampleSection({ title: 'Destructive item', children: [destructiveMenu(model, h)] }, h),
      ],
    },
    h,
  ),
);

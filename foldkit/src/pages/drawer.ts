import { Array, Duration, Effect, Option, Schema } from 'effect';
import { Command, Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Avatar from '../pavo/avatar.ts';
import * as Button from '../pavo/button.ts';
import * as Drawer from '../pavo/drawer.ts';
import { icon } from '../pavo/icon.ts';
import * as Tabs from '../pavo/tabs.ts';

export const title = 'Drawer';
export const description = 'A menu on a phone: a bottom sheet you swipe away, with pages.';

const CLOSE_AFTER_PICK = Duration.millis(220);

const Workspace = Schema.Literals(['family', 'office']);
type Workspace = typeof Workspace.Type;

const Theme = Schema.Literals(['light', 'dark', 'system']);
type Theme = typeof Theme.Type;

const WORKSPACES: ReadonlyArray<Readonly<{ id: Workspace; title: string; description: string; icon: Html }>> = [
  { id: 'family', title: 'Parent portal', description: 'Müller family', icon: icon('home') },
  { id: 'office', title: 'Administration', description: 'Staff access', icon: icon('building') },
];

export const Model = Schema.Struct({
  accountMenu: Drawer.Model,
  workspace: Workspace,
  theme: Theme,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedAccountMenu: {},
  ClickedPushWorkspace: {},
  ClickedSignOut: {},
  PickedWorkspace: { workspace: Workspace },
  UpdatedTheme: { theme: Theme },
  CompletedWaitAfterPick: {},
  GotAccountMenuMessage: { message: Drawer.Message },
});
export type Message = typeof Message.Type;

const WaitAfterPick = Command.define('WaitAfterPick', {
  messages: [Message.CompletedWaitAfterPick],
  execute: Effect.sleep(CLOSE_AFTER_PICK).pipe(Effect.as(Message.CompletedWaitAfterPick())),
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    accountMenu: Drawer.init({ id: 'drawer-account-menu', initialPage: 'root' }),
    workspace: 'family',
    theme: 'system',
  },
});

const toAccountMenuMessage = (message: Drawer.Message): Message => Message.GotAccountMenuMessage({ message });

const accountMenuFold = {
  read: (model: Model) => Option.some(model.accountMenu),
  write: (model: Model, nextAccountMenu: Drawer.Model) => modifyFields(model, { accountMenu: () => nextAccountMenu }),
  toParentMessage: toAccountMenuMessage,
};

const foldAccountMenu = Update.foldChild({ update: Drawer.update, ...accountMenuFold });
const foldAccountMenuOpen = Update.foldChildStep({ update: Drawer.open, ...accountMenuFold });
const foldAccountMenuClose = Update.foldChildStep({ update: Drawer.close, ...accountMenuFold });
const foldAccountMenuPushWorkspace = Update.foldChildStep({
  update: (accountMenu: Drawer.Model) => Drawer.push(accountMenu, 'workspace'),
  ...accountMenuFold,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedAccountMenu: () => foldAccountMenuOpen(model),
    ClickedPushWorkspace: () => foldAccountMenuPushWorkspace(model),
    ClickedSignOut: () => foldAccountMenuClose(model),
    PickedWorkspace: ({ workspace }) => ({
      model: modifyFields(model, { workspace: () => workspace }),
      commands: [WaitAfterPick()],
    }),
    UpdatedTheme: ({ theme }) => ({ model: modifyFields(model, { theme: () => theme }) }),
    CompletedWaitAfterPick: () => foldAccountMenuClose(model),
    GotAccountMenuMessage: ({ message }) => foldAccountMenu(model, message),
  });

const currentWorkspace = (model: Model) =>
  Option.getOrElse(
    Array.findFirst(WORKSPACES, (option) => option.id === model.workspace),
    () => ({ id: model.workspace, title: '', description: '', icon: icon('home') }),
  );

const toTheme = (value: string): Theme =>
  Option.getOrElse(
    Array.findFirst(Theme.literals, (theme) => theme === value),
    () => 'system',
  );

const rootPage = (model: Model, h: HtmlBuilder<Message>): Drawer.PageConfig => ({
  page: 'root',
  children: [
    h.div(
      [h.DataAttribute('drawer-row', ''), h.Class('flex items-center gap-part px-related pb-related')],
      [
        Avatar.view({ size: '3xl', fallback: ['AM'] }, h),
        h.div(
          [h.Class('min-w-0')],
          [
            h.p([h.Class('truncate font-medium')], ['Anna Müller']),
            h.p(
              [h.Class('truncate text-caption text-muted-foreground')],
              [`Lindenschule · ${currentWorkspace(model).title}`],
            ),
          ],
        ),
      ],
    ),
    Drawer.menuGroup(
      {
        children: [
          Drawer.menuItem({ children: [icon('settings'), h.span([], ['Settings'])] }, h),
          Drawer.menuItem(
            {
              isPush: true,
              onClick: Message.ClickedPushWorkspace(),
              attributes: [h.Id(Drawer.pushTriggerId(model.accountMenu, 'workspace'))],
              children: [
                icon('device-desktop'),
                h.span([], ['Workspace']),
                Drawer.menuValue({ children: [currentWorkspace(model).title] }, h),
              ],
            },
            h,
          ),
          Drawer.menuRow(
            {
              children: [
                model.theme === 'dark' ? icon('moon') : icon('sun'),
                h.span([h.Id('drawer-account-theme')], ['Appearance']),
                Tabs.radioGroup(
                  {
                    variant: 'inline',
                    ariaLabelledBy: 'drawer-account-theme',
                    value: model.theme,
                    onValueChange: (value) => Message.UpdatedTheme({ theme: toTheme(value) }),
                    radios: [
                      { value: 'light', ariaLabel: 'Light', children: [icon('sun')] },
                      { value: 'dark', ariaLabel: 'Dark', children: [icon('moon')] },
                      { value: 'system', ariaLabel: 'System', children: [icon('device-desktop')] },
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
    Drawer.menuGroup(
      {
        children: [
          Drawer.menuItem({ children: [icon('message-report'), h.span([], ['Report a problem'])] }, h),
          Drawer.menuItem(
            {
              intent: 'destructive',
              onClick: Message.ClickedSignOut(),
              children: [icon('logout'), h.span([], ['Sign out'])],
            },
            h,
          ),
        ],
      },
      h,
    ),
  ],
});

const workspacePage = (model: Model, h: HtmlBuilder<Message>): Drawer.PageConfig => ({
  page: 'workspace',
  title: 'Workspace',
  children: [
    Drawer.optionGroup(
      {
        attributes: [h.AriaLabel('Workspace')],
        children: Array.map(WORKSPACES, (option) =>
          Drawer.option(
            {
              isChecked: model.workspace === option.id,
              onClick: Message.PickedWorkspace({ workspace: option.id }),
              children: [
                Drawer.optionMedia({ children: [option.icon] }, h),
                Drawer.optionContent(
                  {
                    children: [
                      Drawer.optionTitle({ children: [option.title] }, h),
                      Drawer.optionDescription({ children: [option.description] }, h),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        ),
      },
      h,
    ),
  ],
});

const accountMenu = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  Button.view(
    {
      onClick: Message.ClickedAccountMenu(),
      attributes: [h.AriaHasPopup('dialog'), h.AriaExpanded(Drawer.isOpen(model.accountMenu))],
      children: ['Account menu'],
    },
    h,
  ),
  Drawer.view(
    {
      model: model.accountMenu,
      toParentMessage: toAccountMenuMessage,
      ariaLabel: 'Account menu',
      pages: [rootPage(model, h), workspacePage(model, h)],
    },
    h,
  ),
];

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A menu on a phone: floating 8px in from the bottom, springing up (duration-drawer ease-spring), swiped down to dismiss. Built on the Dialog Model; a Mount reads the swipe. For a task next to the page, use a Sheet.',
      sections: [
        exampleSection(
          {
            title: 'Account menu, with pages',
            description: [
              code('Drawer.Model', h),
              ' holds the page history: ',
              code('Drawer.push', h),
              ' morphs to the next page: its rows blur out, the next page’s cascade in from the side, the drawer springs to its height. The page’s back button pops it; on open the rows rise in. ',
              code('Drawer.menuGroup', h),
              's part with a hairline; ',
              code('Drawer.option', h),
              ' is a choice with a check.',
            ],
            children: accountMenu(model, h),
          },
          h,
        ),
      ],
    },
    h,
  ),
);

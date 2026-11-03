import { Array, Option, Record, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { exampleSection, code, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import { cn } from '../pavo/cn.ts';
import * as Command from '../pavo/command.ts';
import * as Dialog from '../pavo/dialog.ts';
import { icon } from '../pavo/icon.ts';
import * as Kbd from '../pavo/kbd.ts';

export const title = 'Command';
export const description = 'A filterable list of commands; the palette.';

const DOCUMENTS = ['Onboarding guide', 'Q3 roadmap', 'Release checklist', 'Brand guidelines', 'Invoice template'];
const WORKSPACES = ['Acme', 'Globex', 'Initech', 'Umbrella'];

const CommandKey = Schema.Literals(['palette', 'grouped', 'footer', 'standalone']);
type CommandKey = typeof CommandKey.Type;

export const Model = Schema.Struct({
  commands: Schema.Record(CommandKey, Command.Model),
  paletteDialog: Dialog.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedSearch: {},
  GotCommandMessage: { key: CommandKey, message: Command.Message },
  GotPaletteDialogMessage: { message: Dialog.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    commands: {
      palette: Command.init({ id: 'command-palette' }),
      grouped: Command.init({ id: 'command-grouped' }),
      footer: Command.init({ id: 'command-footer' }),
      standalone: Command.init({ id: 'command-standalone' }),
    },
    paletteDialog: Dialog.init({ id: 'command-palette-dialog', isAnimated: true }),
  },
});

const toPaletteDialogMessage = (message: Dialog.Message): Message => Message.GotPaletteDialogMessage({ message });

const writeCommand = (model: Model, key: CommandKey, nextCommand: Command.Model): Model =>
  modifyFields(model, { commands: Record.set(key, nextCommand) });

const paletteDialogFold = {
  read: (model: Model) => Option.some(model.paletteDialog),
  write: (model: Model, nextPaletteDialog: Dialog.Model) =>
    modifyFields(model, { paletteDialog: () => nextPaletteDialog }),
  toParentMessage: toPaletteDialogMessage,
  foldOutMessage: Dialog.OutMessage.match<Update.Step<Model, Message>>({
    Opened: () => (stepModel) => ({ model: stepModel }),
    Closed: () => (stepModel) => ({
      model: writeCommand(stepModel, 'palette', Command.reset(stepModel.commands.palette)),
    }),
  }),
};

const foldPaletteDialog = Update.foldChild({ update: Dialog.update, ...paletteDialogFold });
const foldPaletteDialogOpen = Update.foldChildStep({ update: Dialog.open, ...paletteDialogFold });
const foldPaletteDialogClose = Update.foldChildStep({ update: Dialog.close, ...paletteDialogFold });

const foldCommand = Update.foldChildAt({
  update: Command.update,
  readAt: (model: Model, key: CommandKey) => Option.some(model.commands[key]),
  writeAt: writeCommand,
  toParentMessage: (key: CommandKey, message: Command.Message) => Message.GotCommandMessage({ key, message }),
  foldOutMessage: (key: CommandKey) =>
    Command.OutMessage.match<Update.Step<Model, Message>>({
      Selected: () => (stepModel) => (key === 'palette' ? foldPaletteDialogClose(stepModel) : { model: stepModel }),
    }),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedSearch: () => foldPaletteDialogOpen(model),
    GotCommandMessage: ({ key, message }) => foldCommand(model, key, message),
    GotPaletteDialogMessage: ({ message }) => foldPaletteDialog(model, message),
  });

const pagesAndActions = (h: HtmlBuilder<Message>): ReadonlyArray<Command.Group> => [
  {
    heading: 'Pages',
    items: [
      { value: 'Inbox', children: [icon('inbox'), 'Inbox', Command.shortcut({ children: ['G I'] }, h)] },
      { value: 'Projects', children: [icon('folder'), 'Projects', Command.shortcut({ children: ['G P'] }, h)] },
    ],
  },
  {
    heading: 'Actions',
    hasSeparatorBefore: true,
    items: [
      { value: 'Invite member', children: [icon('user-plus'), 'Invite member'] },
      { value: 'Settings', children: [icon('settings'), 'Settings', Command.shortcut({ children: ['⌘,'] }, h)] },
    ],
  },
];

const documentGroups: ReadonlyArray<Command.Group> = [
  {
    heading: 'Documents',
    items: Array.map(DOCUMENTS, (document) => ({ value: document, children: [icon('file-text'), document] })),
  },
];

const command = (
  model: Model,
  key: CommandKey,
  config: Omit<Command.ViewConfig<Message>, 'model' | 'toParentMessage'>,
  h: HtmlBuilder<Message>,
): Html =>
  Command.view(
    {
      model: model.commands[key],
      toParentMessage: (message) => Message.GotCommandMessage({ key, message }),
      ...config,
    },
    h,
  );

const POPUP_SURFACE = 'rounded-popup bg-popover text-popover-foreground shadow-popup';

const resultCountText = (count: number): string => (count === 1 ? '1 result' : `${count} results`);

const footerExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class(cn(POPUP_SURFACE, 'w-full max-w-lg overflow-hidden'))],
    [
      command(
        model,
        'footer',
        {
          groups: documentGroups,
          placeholder: 'Search documents',
          emptyText: 'No document with that name',
          footer: [
            Command.footer(
              {
                children: [
                  h.span(
                    [h.Class('tabular-nums')],
                    [resultCountText(Command.resultCount(documentGroups, model.commands.footer.query))],
                  ),
                  h.span(
                    [h.Class('flex items-center gap-4 pointer-coarse:hidden')],
                    [
                      h.span(
                        [h.Class('flex items-center gap-1.5')],
                        [Kbd.view({ children: ['↑'] }, h), Kbd.view({ children: ['↓'] }, h), 'Navigate'],
                      ),
                      h.span([h.Class('flex items-center gap-1.5')], [Kbd.view({ children: ['↵'] }, h), 'Open']),
                    ],
                  ),
                ],
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  );

const standalone = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-md',
      children: [
        Card.header({ children: [Card.title({ children: ['Switch workspace'] }, h)] }, h),
        Card.content(
          {
            className: 'overflow-hidden',
            children: [
              command(
                model,
                'standalone',
                {
                  groups: [
                    { items: Array.map(WORKSPACES, (workspace) => ({ value: workspace, children: [workspace] })) },
                  ],
                  placeholder: 'Search workspaces',
                  emptyText: 'No workspace found',
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
      description:
        'A filterable list of commands: the palette in a dialog, or a list inline. For picking a value in a form, Combobox.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('Command.dialog({ title })', h), ', opened from a button; an app also binds ⌘K.'],
            children: [
              Button.view(
                {
                  onClick: Message.ClickedSearch(),
                  children: [icon('search', { dataIcon: 'inline-start' }), 'Search'],
                },
                h,
              ),
              Command.dialog(
                {
                  model: model.paletteDialog,
                  toParentMessage: toPaletteDialogMessage,
                  title: 'Commands',
                  description: 'Find a page or an action.',
                  children: [
                    command(
                      model,
                      'palette',
                      { groups: pagesAndActions(h), placeholder: 'Search pages and actions', emptyText: 'No results' },
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
        exampleSection(
          {
            title: 'Grouped',
            description: [code('Command.Group heading · hasSeparatorBefore · Command.shortcut', h)],
            children: [
              h.div(
                [h.Class(cn(POPUP_SURFACE, 'w-96 overflow-hidden'))],
                [
                  command(
                    model,
                    'grouped',
                    { groups: pagesAndActions(h), placeholder: 'Search pages and actions', emptyText: 'No results' },
                    h,
                  ),
                ],
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Footer',
            description: [
              code('Command.footer', h),
              ' under the list: a result count (',
              code('Command.resultCount', h),
              ') and the keys.',
            ],
            children: [footerExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Standalone',
            description: 'Inline in a card: a filterable list without a popup.',
            isBare: true,
            children: [standalone(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

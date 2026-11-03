import { Array, Duration, Effect, Option, Schema, pipe } from 'effect';
import { Command, Dom, Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Dialog from '../pavo/dialog.ts';
import * as DropdownMenu from '../pavo/dropdown-menu.ts';
import * as Field from '../pavo/field.ts';
import { icon } from '../pavo/icon.ts';
import * as Input from '../pavo/input.ts';
import type { Child } from '../pavo/part.ts';
import * as Textarea from '../pavo/textarea.ts';

export const title = 'Dialog';
export const description = 'A modal for a task: a shell with the header and footer, the content in a card.';

const DialogKey = Schema.Literals([
  'Invite',
  'SizeSm',
  'SizeDefault',
  'SizeLg',
  'SizeXl',
  'NoFooter',
  'WithoutCloseButton',
  'ScrollingBody',
  'EditProject',
  'ManageMembers',
  'RenameProject',
  'ProjectDetails',
  'NewTask',
]);
type DialogKey = typeof DialogKey.Type;

const DIALOG_KEYS = DialogKey.literals;
const SENSITIVE_DIALOG_KEYS: ReadonlyArray<DialogKey> = ['NewTask'];

const InviteForm = Schema.Struct({
  email: Schema.String,
  note: Schema.String,
  isSubmitted: Schema.Boolean,
  isSending: Schema.Boolean,
});
type InviteForm = typeof InviteForm.Type;

const PROJECTS_ROUTE = '/projects';
const TASKS_ROUTE = '/projects/website-redesign/tasks';
const SEND_DELAY = Duration.millis(1000);
const EMAIL_PATTERN = /^\S+@\S+$/;
const EMAIL_ERROR = 'Enter an email address.';
const LEAVE_PROMPT = 'Leave this page? Your draft is lost.';

export const Model = Schema.Struct({
  dialogs: Schema.Record(DialogKey, Dialog.Model),
  actionsMenu: DropdownMenu.Model,
  inviteForm: InviteForm,
  route: Schema.String,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedOpenDialog: { key: DialogKey },
  ClickedCloseDialog: { key: DialogKey },
  GotDialogMessage: { key: DialogKey, message: Dialog.Message },
  GotActionsMenuMessage: { message: DropdownMenu.Message },
  UpdatedInviteEmail: { value: Schema.String },
  UpdatedInviteNote: { value: Schema.String },
  SubmittedInvite: {},
  CompletedSendInvite: {},
  CompletedFocusInviteEmail: {},
  ClickedGoToTasks: {},
  CompletedConfirmLeave: { isConfirmed: Schema.Boolean },
});
export type Message = typeof Message.Type;

const SendInvite = Command.define('SendInvite', {
  messages: [Message.CompletedSendInvite],
  execute: Effect.sleep(SEND_DELAY).pipe(Effect.as(Message.CompletedSendInvite())),
});

const FocusInviteEmail = Command.define('FocusInviteEmail', {
  messages: [Message.CompletedFocusInviteEmail],
  execute: Dom.focus('#invite-email').pipe(Effect.ignore, Effect.as(Message.CompletedFocusInviteEmail())),
});

const ConfirmLeave = Command.define('ConfirmLeave', {
  messages: [Message.CompletedConfirmLeave],
  execute: Effect.sync(() => Message.CompletedConfirmLeave({ isConfirmed: window.confirm(LEAVE_PROMPT) })),
});

const emptyInviteForm: InviteForm = { email: '', note: '', isSubmitted: false, isSending: false };

const initDialog = (key: DialogKey): Dialog.Model => Dialog.init({ id: `dialog-${key}`, isAnimated: true });

const initDialogs = (): Model['dialogs'] => ({
  Invite: initDialog('Invite'),
  SizeSm: initDialog('SizeSm'),
  SizeDefault: initDialog('SizeDefault'),
  SizeLg: initDialog('SizeLg'),
  SizeXl: initDialog('SizeXl'),
  NoFooter: initDialog('NoFooter'),
  WithoutCloseButton: initDialog('WithoutCloseButton'),
  ScrollingBody: initDialog('ScrollingBody'),
  EditProject: initDialog('EditProject'),
  ManageMembers: initDialog('ManageMembers'),
  RenameProject: initDialog('RenameProject'),
  ProjectDetails: initDialog('ProjectDetails'),
  NewTask: initDialog('NewTask'),
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    dialogs: initDialogs(),
    actionsMenu: DropdownMenu.init({ id: 'dialog-actions-menu', isAnimated: true, isModal: true }),
    inviteForm: emptyInviteForm,
    route: PROJECTS_ROUTE,
  },
});

const toDialogMessage = (key: DialogKey, message: Dialog.Message): Message =>
  Message.GotDialogMessage({ key, message });

const foldDialogOutMessage = (_key: DialogKey) =>
  Dialog.OutMessage.match<Update.Step<Model, Message>>({
    Opened: () => (stepModel) => ({ model: stepModel }),
    Closed: () => (stepModel) => ({ model: stepModel }),
  });

const foldDialog = Update.foldChildAt({
  update: Dialog.update,
  readAt: (model: Model, key: DialogKey) => Option.some(model.dialogs[key]),
  writeAt: (model: Model, key: DialogKey, nextDialog: Dialog.Model) =>
    modifyFields(model, { dialogs: (dialogs) => ({ ...dialogs, [key]: nextDialog }) }),
  toParentMessage: toDialogMessage,
  foldOutMessage: foldDialogOutMessage,
});

const ActionsMenu = DropdownMenu.create<'Rename…'>();

const toActionsMenuMessage = (message: DropdownMenu.Message): Message => Message.GotActionsMenuMessage({ message });

const foldActionsMenuOutMessage = DropdownMenu.OutMessage.match<
  Update.Step<Model, Message>,
  DropdownMenu.OutMessage<'Rename…'>
>({
  Selected: () => (stepModel) => openDialog('RenameProject')(stepModel),
});

const foldActionsMenu = Update.foldChild({
  update: ActionsMenu.update,
  read: (model: Model) => Option.some(model.actionsMenu),
  write: (model: Model, nextActionsMenu: DropdownMenu.Model) =>
    modifyFields(model, { actionsMenu: () => nextActionsMenu }),
  toParentMessage: toActionsMenuMessage,
  foldOutMessage: foldActionsMenuOutMessage,
});

const openDialog = (key: DialogKey) => (model: Model) => foldDialog(model, key, Dialog.Message.RequestedOpen());
const closeDialog = (key: DialogKey) => (model: Model) => foldDialog(model, key, Dialog.Message.RequestedClose());

const isEmailValid = (email: string): boolean => EMAIL_PATTERN.test(email);

const isSensitiveDialogOpen = (model: Model): boolean =>
  Array.some(SENSITIVE_DIALOG_KEYS, (key) => Dialog.isOpen(model.dialogs[key]));

const closeOverlays = (model: Model): Update.Return<Model, Message> =>
  Update.combine(
    model,
    pipe(
      DIALOG_KEYS,
      Array.filter((key) => !Array.contains(SENSITIVE_DIALOG_KEYS, key)),
      Array.map(closeDialog),
    ),
  );

const navigateToTasks = (model: Model): Update.Return<Model, Message> =>
  closeOverlays(modifyFields(model, { route: () => TASKS_ROUTE }));

const modifyInviteForm = (model: Model, modify: (form: InviteForm) => InviteForm): Model =>
  modifyFields(model, { inviteForm: modify });

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedOpenDialog: ({ key }) => openDialog(key)(model),
    ClickedCloseDialog: ({ key }) => closeDialog(key)(model),
    GotDialogMessage: ({ key, message }) => foldDialog(model, key, message),
    GotActionsMenuMessage: ({ message }) => foldActionsMenu(model, message),
    UpdatedInviteEmail: ({ value }) => ({
      model: modifyInviteForm(model, (form) => modifyFields(form, { email: () => value })),
    }),
    UpdatedInviteNote: ({ value }) => ({
      model: modifyInviteForm(model, (form) => modifyFields(form, { note: () => value })),
    }),
    SubmittedInvite: () => {
      const nextModel = modifyInviteForm(model, (form) => modifyFields(form, { isSubmitted: () => true }));
      if (model.inviteForm.isSending) {
        return { model: nextModel };
      } else if (!isEmailValid(model.inviteForm.email)) {
        return { model: nextModel, commands: [FocusInviteEmail()] };
      } else {
        return {
          model: modifyInviteForm(nextModel, (form) => modifyFields(form, { isSending: () => true })),
          commands: [SendInvite()],
        };
      }
    },
    CompletedFocusInviteEmail: () => ({ model }),
    CompletedSendInvite: () => closeDialog('Invite')(modifyInviteForm(model, () => emptyInviteForm)),
    ClickedGoToTasks: () => {
      if (isSensitiveDialogOpen(model)) {
        return { model, commands: [ConfirmLeave()] };
      } else {
        return navigateToTasks(model);
      }
    },
    CompletedConfirmLeave: ({ isConfirmed }) => (isConfirmed ? navigateToTasks(model) : { model }),
  });

const trigger = (model: Model, key: DialogKey, children: ReadonlyArray<Child>, h: HtmlBuilder<Message>): Html =>
  Button.view(
    {
      onClick: Message.ClickedOpenDialog({ key }),
      attributes: [h.AriaHasPopup('dialog'), h.AriaExpanded(Dialog.isOpen(model.dialogs[key]))],
      children,
    },
    h,
  );

type DialogConfig = Omit<Dialog.ViewConfig<Message>, 'model' | 'toParentMessage'>;

const dialog = (model: Model, key: DialogKey, config: DialogConfig, h: HtmlBuilder<Message>): Html =>
  Dialog.view(
    {
      model: model.dialogs[key],
      toParentMessage: (message) => toDialogMessage(key, message),
      ...config,
    },
    h,
  );

const header = (
  render: Dialog.RenderInfo,
  titleText: string,
  maybeDescription: Option.Option<string>,
  h: HtmlBuilder<Message>,
): Html =>
  Dialog.header(
    {
      children: [
        Dialog.title({ render: render.title, children: [titleText] }, h),
        ...Option.match(maybeDescription, {
          onNone: () => [],
          onSome: (descriptionText) => [
            Dialog.description({ render: render.description, children: [descriptionText] }, h),
          ],
        }),
      ],
    },
    h,
  );

const inviteFields = (form: InviteForm, h: HtmlBuilder<Message>): Html => {
  const isEmailInvalid = form.isSubmitted && !isEmailValid(form.email);
  return Field.group(
    {
      children: [
        Field.view(
          {
            isInvalid: isEmailInvalid,
            children: [
              Field.label({ forId: 'invite-email', children: ['Email'] }, h),
              Input.view(
                {
                  id: 'invite-email',
                  type: 'email',
                  placeholder: 'name@company.com',
                  value: form.email,
                  onInput: (value) => Message.UpdatedInviteEmail({ value }),
                  isInvalid: isEmailInvalid,
                },
                h,
              ),
              Field.error({ errors: isEmailInvalid ? [EMAIL_ERROR] : [] }, h),
            ],
          },
          h,
        ),
        Field.view(
          {
            children: [
              Field.label({ forId: 'invite-note', children: ['Message'] }, h),
              Textarea.view(
                {
                  id: 'invite-note',
                  rows: 3,
                  placeholder: 'Optional',
                  value: form.note,
                  onInput: (value) => Message.UpdatedInviteNote({ value }),
                },
                h,
              ),
              Field.description({ children: ['Shown above the link in the invitation.'] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );
};

const defaultExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'Invite', ['Invite member'], h),
  dialog(
    model,
    'Invite',
    {
      hasDescription: true,
      content: (render) => [
        header(render, 'Invite member', Option.some('We’ll email them a link to join the workspace.'), h),
        h.form(
          [h.Novalidate(true), h.OnSubmit(Message.SubmittedInvite()), h.Class('contents')],
          [
            Dialog.body({ children: [inviteFields(model.inviteForm, h)] }, h),
            Dialog.footer(
              {
                children: [
                  Button.view({ attributes: render.closeButton, children: ['Cancel'] }, h),
                  Button.view(
                    {
                      type: 'submit',
                      intent: 'primary',
                      isPending: model.inviteForm.isSending,
                      children: ['Send invite'],
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
          ],
        ),
      ],
    },
    h,
  ),
];

const SIZES: ReadonlyArray<Readonly<{ key: DialogKey; size: Dialog.DialogSize; title: string; body: string }>> = [
  { key: 'SizeSm', size: 'sm', title: 'Rename project', body: 'A single field.' },
  { key: 'SizeDefault', size: 'default', title: 'Invite members', body: 'A short form.' },
  { key: 'SizeLg', size: 'lg', title: 'Import members', body: 'A preview table of the rows to import.' },
  { key: 'SizeXl', size: 'xl', title: 'Invoice INV-2041', body: 'A document preview.' },
];

const sizesExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-wrap gap-2')],
    Array.flatMap(SIZES, ({ key, size, title: titleText, body }) => [
      trigger(model, key, [size], h),
      dialog(
        model,
        key,
        {
          size,
          hasDescription: true,
          content: (render) => [
            header(render, titleText, Option.some(body), h),
            Dialog.body({ children: [h.div([h.Class('h-32 rounded-control-lg bg-muted')])] }, h),
          ],
        },
        h,
      ),
    ]),
  );

const noFooterExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'NoFooter', ['Invite link'], h),
  dialog(
    model,
    'NoFooter',
    {
      hasDescription: true,
      content: (render) => [
        header(render, 'Invite link', Option.some('Anyone with this link can join the workspace.'), h),
        Dialog.body(
          {
            children: [
              Input.view(
                {
                  id: 'invite-link',
                  isReadOnly: true,
                  defaultValue: 'https://acme.app/join/7f3a',
                  ariaLabel: 'Invite link',
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
];

const withoutCloseButtonExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'WithoutCloseButton', ['Terms of service'], h),
  dialog(
    model,
    'WithoutCloseButton',
    {
      isCloseButtonShown: false,
      hasDescription: true,
      content: (render) => [
        header(render, 'Updated terms of service', Option.some('Read them before you continue.'), h),
        Dialog.body(
          {
            children: [
              h.p(
                [h.Class('text-body text-muted-foreground')],
                ['From April 1, deleted files stay in the trash for 30 days before they are removed.'],
              ),
            ],
          },
          h,
        ),
        Dialog.footer(
          { children: [Button.view({ intent: 'primary', attributes: render.closeButton, children: ['Got it'] }, h)] },
          h,
        ),
      ],
    },
    h,
  ),
];

const PRIVACY_SECTIONS = Array.makeBy(12, (index) => ({
  title: `Section ${index + 1}`,
  body: 'We process workspace data only to run the service and never share it with third parties.',
}));

const scrollingBodyExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'ScrollingBody', ['Privacy policy'], h),
  dialog(
    model,
    'ScrollingBody',
    {
      hasDescription: true,
      content: (render) => [
        header(render, 'Privacy policy', Option.some('Last updated March 2025'), h),
        Dialog.body(
          {
            className: 'max-h-80 overflow-y-auto',
            children: [
              h.div(
                [h.Class('flex flex-col gap-4')],
                Array.map(PRIVACY_SECTIONS, (section) =>
                  h.keyed('section')(
                    section.title,
                    [h.Class('flex flex-col gap-1')],
                    [
                      h.h3([h.Class('text-body font-medium')], [section.title]),
                      h.p([h.Class('text-body text-muted-foreground')], [section.body]),
                    ],
                  ),
                ),
              ),
            ],
          },
          h,
        ),
        Dialog.footer(
          { children: [Button.view({ intent: 'primary', attributes: render.closeButton, children: ['Close'] }, h)] },
          h,
        ),
      ],
    },
    h,
  ),
];

const nestedExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'EditProject', ['Edit project'], h),
  dialog(
    model,
    'EditProject',
    {
      hasDescription: true,
      nestedDialogCount: Dialog.isOpen(model.dialogs.ManageMembers) ? 1 : 0,
      content: (render) => [
        header(render, 'Edit project', Option.some('Website redesign · 8 members'), h),
        Dialog.body({ children: [trigger(model, 'ManageMembers', ['Manage members'], h)] }, h),
        Dialog.footer(
          {
            children: [
              Button.view({ attributes: render.closeButton, children: ['Cancel'] }, h),
              Button.view({ intent: 'primary', children: ['Save'] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  ),
  dialog(
    model,
    'ManageMembers',
    {
      size: 'sm',
      isNested: true,
      hasDescription: true,
      content: (render) => [
        header(render, 'Members', Option.some('Who can see and edit this project.'), h),
        Dialog.footer(
          { children: [Button.view({ intent: 'primary', attributes: render.closeButton, children: ['Done'] }, h)] },
          h,
        ),
      ],
    },
    h,
  ),
];

const openedFromAMenuExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  ActionsMenu.view(
    {
      model: model.actionsMenu,
      toParentMessage: toActionsMenuMessage,
      trigger: { emphasis: 'ghost', size: 'icon', ariaLabel: 'Actions', children: [icon('dots')] },
      items: ['Rename…'],
      itemToConfig: (item) => ({ children: [icon('pencil'), item] }),
    },
    h,
  ),
  dialog(
    model,
    'RenameProject',
    {
      content: (render) => [
        header(render, 'Rename project', Option.none(), h),
        Dialog.body(
          {
            children: [
              Field.view(
                {
                  children: [
                    Field.label({ forId: 'project-name', children: ['Name'] }, h),
                    Input.view({ id: 'project-name', defaultValue: 'Website redesign' }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Dialog.footer(
          {
            children: [
              Button.view({ attributes: render.closeButton, children: ['Cancel'] }, h),
              Button.view(
                {
                  intent: 'primary',
                  onClick: Message.ClickedCloseDialog({ key: 'RenameProject' }),
                  children: ['Save'],
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
];

const closeOnNavigationExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-center gap-related')],
    [
      h.div(
        [h.Class('flex gap-related')],
        [
          trigger(model, 'ProjectDetails', ['Project details'], h),
          dialog(
            model,
            'ProjectDetails',
            {
              hasDescription: true,
              content: (render) => [
                header(render, 'Website redesign', Option.some('Due March 14 · 12 open tasks'), h),
                Dialog.footer(
                  {
                    children: [
                      Button.view(
                        { intent: 'primary', onClick: Message.ClickedGoToTasks(), children: ['Go to tasks'] },
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
          trigger(model, 'NewTask', ['New task'], h),
          dialog(
            model,
            'NewTask',
            {
              content: (render) => [
                header(render, 'New task', Option.none(), h),
                Dialog.body(
                  {
                    children: [
                      Field.view(
                        {
                          children: [
                            Field.label({ forId: 'new-task-title', children: ['Title'] }, h),
                            Input.view({ id: 'new-task-title', placeholder: 'Write the brief' }, h),
                          ],
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                Dialog.footer(
                  {
                    children: [
                      Button.view(
                        { intent: 'primary', onClick: Message.ClickedGoToTasks(), children: ['Go to tasks'] },
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
        ],
      ),
      h.p([h.Class('text-caption text-muted-foreground')], ['Route ', h.span([h.Class('font-mono')], [model.route])]),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'One modal shape: a single popup surface, the footer a muted band under a rule. Dialog, alert dialog and side panel share it.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description:
              'Header and body on the popup surface, the footer a muted band. A form wraps DialogBody and DialogFooter (className="contents"); submit sits in the footer.',
            children: defaultExample(model, h),
          },
          h,
        ),
        exampleSection(
          {
            title: 'Sizes',
            description: [
              code('size', h),
              ': ',
              code('sm', h),
              ' 24rem · ',
              code('default', h),
              ' 28rem · ',
              code('lg', h),
              ' 42rem · ',
              code('xl', h),
              ' 56rem from ',
              code('sm', h),
              ' up.',
            ],
            children: [sizesExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'No footer',
            description: 'Without a footer the body ends the dialog.',
            children: noFooterExample(model, h),
          },
          h,
        ),
        exampleSection(
          {
            title: 'Without close button',
            description: [code('isCloseButtonShown: false', h), ': no ✕, the footer action closes it.'],
            children: withoutCloseButtonExample(model, h),
          },
          h,
        ),
        exampleSection(
          {
            title: 'Scrolling body',
            description: 'A long body scrolls; header and footer stay.',
            children: scrollingBodyExample(model, h),
          },
          h,
        ),
        exampleSection(
          {
            title: 'Nested',
            description: 'A dialog opened from a dialog stacks on it; the one below steps back.',
            children: nestedExample(model, h),
          },
          h,
        ),
        exampleSection(
          {
            title: 'Opened from a menu',
            description: 'The menu’s Selected OutMessage opens the dialog; the dialog lives outside the menu.',
            children: openedFromAMenuExample(model, h),
          },
          h,
        ),
        exampleSection(
          {
            title: 'Close on navigation',
            description: [
              'The route-change update closes every dialog Model but a sensitive one; with a sensitive one open it asks first',
            ],
            children: [closeOnNavigationExample(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

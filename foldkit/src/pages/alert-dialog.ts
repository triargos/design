import { Option, Record, Schema, String } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as AlertDialog from '../pavo/alert-dialog.ts';
import * as Button from '../pavo/button.ts';
import * as Dialog from '../pavo/dialog.ts';
import * as Field from '../pavo/field.ts';
import { icon } from '../pavo/icon.ts';
import type { Child } from '../pavo/part.ts';
import * as Textarea from '../pavo/textarea.ts';

export const title = 'Alert Dialog';
export const description = 'Asks to confirm before an action that cannot be undone.';

const DialogKey = Schema.Literals(['Publish', 'DeleteFile', 'Note', 'DiscardNote', 'DeleteProject']);
type DialogKey = typeof DialogKey.Type;

export const Model = Schema.Struct({
  dialogs: Schema.Record(DialogKey, Dialog.Model),
  note: Schema.String,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedOpenDialog: { key: DialogKey },
  ClickedConfirm: { key: DialogKey },
  ClickedSendNote: {},
  ClickedDiscardNote: {},
  UpdatedNote: { value: Schema.String },
  GotDialogMessage: { key: DialogKey, message: Dialog.Message },
});
export type Message = typeof Message.Type;

const initDialog = (key: DialogKey): Dialog.Model => Dialog.init({ id: `alert-dialog-${key}`, isAnimated: true });

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    dialogs: {
      Publish: initDialog('Publish'),
      DeleteFile: initDialog('DeleteFile'),
      Note: initDialog('Note'),
      DiscardNote: initDialog('DiscardNote'),
      DeleteProject: initDialog('DeleteProject'),
    },
    note: '',
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
    modifyFields(model, { dialogs: Record.set(key, nextDialog) }),
  toParentMessage: toDialogMessage,
  foldOutMessage: foldDialogOutMessage,
});

const openDialog = (key: DialogKey) => (model: Model) => foldDialog(model, key, Dialog.Message.RequestedOpen());
const closeDialog = (key: DialogKey) => (model: Model) => foldDialog(model, key, Dialog.Message.RequestedClose());

const clearNote = (model: Model): Update.Return<Model, Message> => ({
  model: modifyFields(model, { note: () => '' }),
});

const closeNote = (model: Model): Update.Return<Model, Message> =>
  Update.combine(model, [closeDialog('DiscardNote'), closeDialog('Note'), clearNote]);

const isRequestedNoteClose = (key: DialogKey, message: Dialog.Message, model: Model): boolean =>
  key === 'Note' && message._tag === 'RequestedClose' && Dialog.isOpen(model.dialogs.Note);

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedOpenDialog: ({ key }) => openDialog(key)(model),
    ClickedConfirm: ({ key }) => closeDialog(key)(model),
    ClickedSendNote: () => closeNote(model),
    ClickedDiscardNote: () => closeNote(model),
    UpdatedNote: ({ value }) => ({ model: modifyFields(model, { note: () => value }) }),
    GotDialogMessage: ({ key, message }) => {
      if (isRequestedNoteClose(key, message, model) && String.isNonEmpty(model.note)) {
        return openDialog('DiscardNote')(model);
      } else if (isRequestedNoteClose(key, message, model)) {
        return Update.combine(model, [closeDialog('Note'), clearNote]);
      } else {
        return foldDialog(model, key, message);
      }
    },
  });

const trigger = (
  model: Model,
  key: DialogKey,
  style: Pick<Button.ViewConfig<Message>, 'intent' | 'emphasis'>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<Message>,
): Html =>
  Button.view(
    {
      ...style,
      onClick: Message.ClickedOpenDialog({ key }),
      attributes: [h.AriaHasPopup('dialog'), h.AriaExpanded(Dialog.isOpen(model.dialogs[key]))],
      children,
    },
    h,
  );

type ConfirmConfig = Readonly<{
  key: DialogKey;
  size?: AlertDialog.AlertDialogSize;
  maybeMedia: Option.Option<Html>;
  title: string;
  description: string;
  cancelLabel: string;
  actionLabel: string;
  actionIntent: 'primary' | 'destructive';
  onAction: Message;
}>;

const confirmation = (model: Model, config: ConfirmConfig, h: HtmlBuilder<Message>): Html =>
  AlertDialog.view(
    {
      model: model.dialogs[config.key],
      toParentMessage: (message) => toDialogMessage(config.key, message),
      hasDescription: true,
      ...(config.size === undefined ? {} : { size: config.size }),
      content: (render) => [
        AlertDialog.header(
          {
            children: [
              ...Option.match(config.maybeMedia, {
                onNone: () => [],
                onSome: (media) => [AlertDialog.media({ children: [media] }, h)],
              }),
              AlertDialog.title({ render: render.title, children: [config.title] }, h),
              AlertDialog.description({ render: render.description, children: [config.description] }, h),
            ],
          },
          h,
        ),
        AlertDialog.footer(
          {
            children: [
              AlertDialog.cancel({ render, children: [config.cancelLabel] }, h),
              AlertDialog.action(
                { intent: config.actionIntent, onClick: config.onAction, children: [config.actionLabel] },
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

const defaultExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'Publish', { intent: 'primary' }, ['Publish project'], h),
  confirmation(
    model,
    {
      key: 'Publish',
      maybeMedia: Option.none(),
      title: 'Publish the project?',
      description: 'Every member gets notified and can see it right away.',
      cancelLabel: 'Cancel',
      actionLabel: 'Publish',
      actionIntent: 'primary',
      onAction: Message.ClickedConfirm({ key: 'Publish' }),
    },
    h,
  ),
];

const sizesExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'DeleteFile', { intent: 'destructive', emphasis: 'subtle' }, ['Delete file…'], h),
  confirmation(
    model,
    {
      key: 'DeleteFile',
      size: 'sm',
      maybeMedia: Option.some(icon('trash')),
      title: 'Delete file?',
      description: 'Q1-report.pdf will be deleted permanently.',
      cancelLabel: 'Cancel',
      actionLabel: 'Delete',
      actionIntent: 'destructive',
      onAction: Message.ClickedConfirm({ key: 'DeleteFile' }),
    },
    h,
  ),
];

const closeConfirmationExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'Note', {}, ['Write a note'], h),
  Dialog.view(
    {
      model: model.dialogs.Note,
      toParentMessage: (message) => toDialogMessage('Note', message),
      content: (render) => [
        Dialog.header({ children: [Dialog.title({ render: render.title, children: ['Note for the team'] }, h)] }, h),
        Dialog.body(
          {
            children: [
              Field.view(
                {
                  children: [
                    Field.label({ forId: 'team-note', children: ['Note'] }, h),
                    Textarea.view(
                      {
                        id: 'team-note',
                        rows: 4,
                        value: model.note,
                        onInput: (value) => Message.UpdatedNote({ value }),
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
        Dialog.footer(
          {
            children: [
              Button.view({ attributes: render.closeButton, children: ['Cancel'] }, h),
              Button.view({ intent: 'primary', onClick: Message.ClickedSendNote(), children: ['Send'] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  ),
  confirmation(
    model,
    {
      key: 'DiscardNote',
      maybeMedia: Option.none(),
      title: 'Discard the note?',
      description: 'What you wrote will be lost.',
      cancelLabel: 'Keep writing',
      actionLabel: 'Discard',
      actionIntent: 'destructive',
      onAction: Message.ClickedDiscardNote(),
    },
    h,
  ),
];

const destructiveExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'DeleteProject', { intent: 'destructive', emphasis: 'subtle' }, ['Delete project…'], h),
  confirmation(
    model,
    {
      key: 'DeleteProject',
      maybeMedia: Option.none(),
      title: 'Delete the project?',
      description: 'Its tasks, documents and comments are deleted for everyone. This cannot be undone.',
      cancelLabel: 'Cancel',
      actionLabel: 'Delete',
      actionIntent: 'destructive',
      onAction: Message.ClickedConfirm({ key: 'DeleteProject' }),
    },
    h,
  ),
];

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'Asks to confirm an action before it happens. The question in the header, the actions in the footer band; no close button. AlertDialog.action is primary unless set, and does not close the dialog on its own: close it when the action is done.',
      sections: [
        exampleSection({ title: 'Default', children: defaultExample(model, h) }, h),
        exampleSection(
          {
            title: 'Sizes',
            description: [
              code("size: 'sm'", h),
              ' with ',
              code('AlertDialog.media', h),
              ': centered, the two actions in equal columns.',
            ],
            children: sizesExample(model, h),
          },
          h,
        ),
        exampleSection(
          {
            title: 'Close confirmation',
            description: 'Closing a dialog with changes asks first. Type a note, then press Escape.',
            children: closeConfirmationExample(model, h),
          },
          h,
        ),
        exampleSection(
          {
            title: 'Destructive',
            description: ['Opened by destructive/subtle, confirmed by ', code("intent: 'destructive'", h), ' (solid).'],
            children: destructiveExample(model, h),
          },
          h,
        ),
      ],
    },
    h,
  ),
);

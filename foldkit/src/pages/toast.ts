import { Duration, Effect, Option, Schema } from 'effect';
import { Command, Submodel, Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import { icon } from '../pavo/icon.ts';
import type { Child } from '../pavo/part.ts';
import * as Toast from '../pavo/toast.ts';
import * as Tooltip from '../pavo/tooltip.ts';

export const title = 'Toast';
export const description = 'A short report on what the user just did.';

const WORK_DURATION = Duration.millis(1500);
const IMPORT_TOAST_ID = 'import-tasks';
const UPLOAD_TOAST_ID = 'upload-invoice';
const DRAFT_TOAST_ID = 'draft-restored-with-action';
const SAVE_TOOLTIP_ID = 'toast-save-tooltip';

export const Model = Schema.Struct({
  toasts: Toast.Model,
  saveTooltip: Tooltip.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedShowToast: { input: Schema.Struct({ type: Toast.ToastType, title: Schema.String }) },
  ClickedSaveWithError: {},
  ClickedImportTasks: {},
  CompletedImportTasks: {},
  ClickedUploadInvoice: {},
  FailedUploadInvoice: {},
  ClickedRestoreDraftWithAction: {},
  ClickedShowStack: {},
  ClickedSaveAnchored: {},
  GotToastsMessage: { message: Toast.Message },
  GotSaveTooltipMessage: { message: Tooltip.Message },
});
export type Message = typeof Message.Type;

const ImportTasks = Command.define('ImportTasks', {
  messages: [Message.CompletedImportTasks],
  execute: Effect.sleep(WORK_DURATION).pipe(Effect.as(Message.CompletedImportTasks())),
});

const UploadInvoice = Command.define('UploadInvoice', {
  messages: [Message.FailedUploadInvoice],
  execute: Effect.sleep(WORK_DURATION).pipe(Effect.as(Message.FailedUploadInvoice())),
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    toasts: Toast.init({ id: 'toast-page' }),
    saveTooltip: Tooltip.init({ id: SAVE_TOOLTIP_ID, showDelay: Duration.zero }),
  },
});

const toToastsMessage = (message: Toast.Message): Message => Message.GotToastsMessage({ message });
const toSaveTooltipMessage = (message: Tooltip.Message): Message => Message.GotSaveTooltipMessage({ message });

const toastsFold = {
  read: (model: Model) => Option.some(model.toasts),
  write: (model: Model, nextToasts: Toast.Model) => modifyFields(model, { toasts: () => nextToasts }),
  toParentMessage: toToastsMessage,
};

const foldToastsOutMessage = Toast.OutMessage.match<Update.Step<Model, Message>>({
  ClickedAction: () => (stepModel) => foldDismissAll(stepModel),
});

const foldToasts = Update.foldChild({ update: Toast.update, ...toastsFold, foldOutMessage: foldToastsOutMessage });
const foldShow = Update.foldChild({ update: Toast.show, ...toastsFold });
const foldDismissAll = Update.foldChildStep({ update: Toast.dismissAll, ...toastsFold });

const showStep =
  (input: Toast.ShowInput) =>
  (model: Model): Update.Return<Model, Message> =>
    foldShow(model, input);

const foldSaveTooltipOutMessage = Tooltip.OutMessage.match<Update.Step<Model, Message>>({
  Shown: () => (stepModel) => ({ model: stepModel }),
  Hidden: () => (stepModel) => ({ model: stepModel }),
});

const foldSaveTooltip = Update.foldChild({
  update: Tooltip.update,
  read: (model: Model) => Option.some(model.saveTooltip),
  write: (model: Model, nextSaveTooltip: Tooltip.Model) => modifyFields(model, { saveTooltip: () => nextSaveTooltip }),
  toParentMessage: toSaveTooltipMessage,
  foldOutMessage: foldSaveTooltipOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedShowToast: ({ input }) => foldShow(model, input),
    ClickedSaveWithError: () =>
      foldShow(model, {
        type: 'Error',
        title: 'Couldn’t save changes',
        description: 'Check your connection and try again.',
      }),
    ClickedImportTasks: () =>
      Update.combine(model, [
        showStep({ type: 'Loading', title: 'Importing tasks…', id: IMPORT_TOAST_ID }),
        (stepModel) => ({ model: stepModel, commands: [ImportTasks()] }),
      ]),
    CompletedImportTasks: () => foldShow(model, { type: 'Success', title: 'Tasks imported', id: IMPORT_TOAST_ID }),
    ClickedUploadInvoice: () =>
      Update.combine(model, [
        showStep({ type: 'Loading', title: 'Uploading invoice…', id: UPLOAD_TOAST_ID }),
        (stepModel) => ({ model: stepModel, commands: [UploadInvoice()] }),
      ]),
    FailedUploadInvoice: () => foldShow(model, { type: 'Error', title: 'Upload failed', id: UPLOAD_TOAST_ID }),
    ClickedRestoreDraftWithAction: () =>
      foldShow(model, {
        title: 'Draft restored',
        actionLabel: 'Discard',
        timeout: Duration.zero,
        id: DRAFT_TOAST_ID,
      }),
    ClickedShowStack: () =>
      Update.combine(model, [
        showStep({ type: 'Success', title: 'Changes saved' }),
        showStep({ type: 'Info', title: 'A newer version of this document is available' }),
        showStep({
          type: 'Error',
          title: 'Couldn’t save changes',
          description: 'Check your connection and try again.',
        }),
      ]),
    ClickedSaveAnchored: () =>
      foldShow(model, { type: 'Error', title: 'Couldn’t save draft', anchorId: Tooltip.triggerId(SAVE_TOOLTIP_ID) }),
    GotToastsMessage: ({ message }) => foldToasts(model, message),
    GotSaveTooltipMessage: ({ message }) => foldSaveTooltip(model, message),
  });

const liftedSubscriptions = Subscription.lift(Toast.subscriptions)<Model, Message>({
  read: (model) => Option.some(model.toasts),
  toParentMessage: toToastsMessage,
});

export const subscriptions = {
  toastSwipePointer: liftedSubscriptions.swipePointer,
  toastSwipeEscape: liftedSubscriptions.swipeEscape,
};

const showButton = (
  type: Toast.ToastType,
  toastTitle: string,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<Message>,
) => Button.view({ onClick: Message.ClickedShowToast({ input: { type, title: toastTitle } }), children }, h);

const anchoredExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  Tooltip.view(
    {
      model: model.saveTooltip,
      toParentMessage: toSaveTooltipMessage,
      trigger: {
        size: 'icon',
        ariaLabel: 'Save',
        onClick: Message.ClickedSaveAnchored(),
        children: [icon('device-floppy')],
      },
      content: ['Save'],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A short report on what the user just did. Toasts stack bottom right, close after 5 seconds, and pause while hovered. Swipe one away to close it early.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('Toast.show(model, { title })', h), ': neutral news.'],
            children: [showButton('Default', 'Draft restored', ['Restore draft'], h)],
          },
          h,
        ),
        exampleSection({ title: 'Success', children: [showButton('Success', 'Changes saved', ['Save'], h)] }, h),
        exampleSection(
          {
            title: 'Error',
            description: ['With a ', code('description', h), ': why, or what next.'],
            children: [Button.view({ onClick: Message.ClickedSaveWithError(), children: ['Save'] }, h)],
          },
          h,
        ),
        exampleSection(
          { title: 'Warning', children: [showButton('Warning', 'Published, 2 tasks skipped', ['Publish'], h)] },
          h,
        ),
        exampleSection(
          {
            title: 'Info',
            children: [showButton('Info', 'A newer version of this document is available', ['Check for updates'], h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Loading',
            description: 'Spins and stays open until its id is updated to success or error.',
            children: [Button.view({ onClick: Message.ClickedImportTasks(), children: ['Import tasks'] }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Promise',
            description: 'A Command’s result turns the loading toast into success or error in place.',
            children: [Button.view({ onClick: Message.ClickedUploadInvoice(), children: ['Upload invoice'] }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With action',
            description: [
              'One action at most; with an action it stays open (',
              code('timeout: Duration.zero', h),
              ').',
            ],
            children: [
              Button.view({ onClick: Message.ClickedRestoreDraftWithAction(), children: ['Restore draft'] }, h),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Stack',
            description: 'The newest in front, at most three shown. Hover expands the stack.',
            children: [Button.view({ onClick: Message.ClickedShowStack(), children: ['Show three toasts'] }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Dedupe',
            description:
              'The same toast again updates the open one and replays a pulse (a shake for errors). Click twice.',
            children: [showButton('Error', 'Couldn’t save changes', ['Click twice'], h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Anchored',
            description: [
              code('{ anchorId }', h),
              ': next to the control that was used, styled like a tooltip, title only. Closes after 2 seconds.',
            ],
            children: [anchoredExample(model, h)],
          },
          h,
        ),
        Toast.view({ model: model.toasts, toParentMessage: toToastsMessage }, h),
      ],
    },
    h,
  ),
);

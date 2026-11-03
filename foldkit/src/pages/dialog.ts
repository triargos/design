import { Option, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Dialog from '../pavo/dialog.ts';

export const title = 'Dialog';
export const description = 'A modal: a title, a body and a footer of actions, over a dimmed page.';

export const Model = Schema.Struct({
  inviteDialog: Dialog.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedInviteMember: {},
  ClickedSendInvite: {},
  GotInviteDialogMessage: { message: Dialog.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { inviteDialog: Dialog.init({ id: 'invite-dialog', isAnimated: true }) },
});

const toInviteDialogMessage = (message: Dialog.Message): Message => Message.GotInviteDialogMessage({ message });

const foldInviteDialogOutMessage = Dialog.OutMessage.match<Update.Step<Model, Message>>({
  Opened: () => (stepModel) => ({ model: stepModel }),
  Closed: () => (stepModel) => ({ model: stepModel }),
});

const inviteDialogFold = {
  read: (model: Model) => Option.some(model.inviteDialog),
  write: (model: Model, nextInviteDialog: Dialog.Model) =>
    modifyFields(model, { inviteDialog: () => nextInviteDialog }),
  toParentMessage: toInviteDialogMessage,
  foldOutMessage: foldInviteDialogOutMessage,
};

const foldInviteDialog = Update.foldChild({ update: Dialog.update, ...inviteDialogFold });
const foldInviteDialogOpen = Update.foldChildStep({ update: Dialog.open, ...inviteDialogFold });
const foldInviteDialogClose = Update.foldChildStep({ update: Dialog.close, ...inviteDialogFold });

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedInviteMember: () => foldInviteDialogOpen(model),
    ClickedSendInvite: () => foldInviteDialogClose(model),
    GotInviteDialogMessage: ({ message }) => foldInviteDialog(model, message),
  });

const inviteDialog = (model: Model, h: HtmlBuilder<Message>): Html =>
  Dialog.view(
    {
      model: model.inviteDialog,
      toParentMessage: toInviteDialogMessage,
      hasDescription: true,
      content: (render) => [
        Dialog.header(
          {
            children: [
              Dialog.title({ render: render.title, children: ['Invite member'] }, h),
              Dialog.description(
                { render: render.description, children: ['We’ll email them a link to join the workspace.'] },
                h,
              ),
            ],
          },
          h,
        ),
        Dialog.body(
          {
            children: [
              h.p(
                [h.Class('text-body text-muted-foreground')],
                ['The invite form lands here once Field, Input and Textarea are ported.'],
              ),
            ],
          },
          h,
        ),
        Dialog.footer(
          {
            children: [
              Button.view({ attributes: render.closeButton, children: ['Cancel'] }, h),
              Button.view({ intent: 'primary', onClick: Message.ClickedSendInvite(), children: ['Send invite'] }, h),
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
        'A modal on Foldkit’s native <dialog>: focus trap, Escape, backdrop click and scroll lock come from @foldkit/ui; Pavo adds the surface, header, body and footer.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'Header and body on the popup surface, the footer a muted band.',
            children: [
              Button.view({ onClick: Message.ClickedInviteMember(), children: ['Invite member'] }, h),
              inviteDialog(model, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

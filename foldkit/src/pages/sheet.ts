import { Option, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Field from '../pavo/field.ts';
import * as Input from '../pavo/input.ts';
import type { Child } from '../pavo/part.ts';
import * as Sheet from '../pavo/sheet.ts';
import * as Textarea from '../pavo/textarea.ts';

export const title = 'Sheet';
export const description = 'A side panel: the dialog surface at full height.';

const SheetKey = Schema.Literals(['Invite', 'SizeDefault', 'SizeLg', 'Filter', 'Left', 'Right']);
type SheetKey = typeof SheetKey.Type;

export const Model = Schema.Struct({
  sheets: Schema.Record(SheetKey, Sheet.Model),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedOpenSheet: { key: SheetKey },
  GotSheetMessage: { key: SheetKey, message: Sheet.Message },
});
export type Message = typeof Message.Type;

const initSheet = (key: SheetKey): Sheet.Model => Sheet.init({ id: `sheet-${key}`, isAnimated: true });

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    sheets: {
      Invite: initSheet('Invite'),
      SizeDefault: initSheet('SizeDefault'),
      SizeLg: initSheet('SizeLg'),
      Filter: initSheet('Filter'),
      Left: initSheet('Left'),
      Right: initSheet('Right'),
    },
  },
});

const toSheetMessage = (key: SheetKey, message: Sheet.Message): Message => Message.GotSheetMessage({ key, message });

const foldSheetOutMessage = (_key: SheetKey) =>
  Sheet.OutMessage.match<Update.Step<Model, Message>>({
    Opened: () => (stepModel) => ({ model: stepModel }),
    Closed: () => (stepModel) => ({ model: stepModel }),
  });

const foldSheet = Update.foldChildAt({
  update: Sheet.update,
  readAt: (model: Model, key: SheetKey) => Option.some(model.sheets[key]),
  writeAt: (model: Model, key: SheetKey, nextSheet: Sheet.Model) =>
    modifyFields(model, { sheets: (sheets) => ({ ...sheets, [key]: nextSheet }) }),
  toParentMessage: toSheetMessage,
  foldOutMessage: foldSheetOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedOpenSheet: ({ key }) => foldSheet(model, key, Sheet.Message.RequestedOpen()),
    GotSheetMessage: ({ key, message }) => foldSheet(model, key, message),
  });

const trigger = (model: Model, key: SheetKey, children: ReadonlyArray<Child>, h: HtmlBuilder<Message>): Html =>
  Button.view(
    {
      onClick: Message.ClickedOpenSheet({ key }),
      attributes: [h.AriaHasPopup('dialog'), h.AriaExpanded(Sheet.isOpen(model.sheets[key]))],
      children,
    },
    h,
  );

type SheetConfig = Omit<Sheet.ViewConfig<Message>, 'model' | 'toParentMessage'>;

const sheet = (model: Model, key: SheetKey, config: SheetConfig, h: HtmlBuilder<Message>): Html =>
  Sheet.view({ model: model.sheets[key], toParentMessage: (message) => toSheetMessage(key, message), ...config }, h);

const mutedText = (text: string, h: HtmlBuilder<Message>): Html =>
  h.p([h.Class('text-body text-muted-foreground')], [text]);

const simpleSheet = (
  model: Model,
  key: SheetKey,
  titleText: string,
  bodyText: string,
  config: Omit<SheetConfig, 'content'>,
  h: HtmlBuilder<Message>,
): Html =>
  sheet(
    model,
    key,
    {
      ...config,
      content: (render) => [
        Sheet.header({ children: [Sheet.title({ render: render.title, children: [titleText] }, h)] }, h),
        Sheet.body({ children: [mutedText(bodyText, h)] }, h),
      ],
    },
    h,
  );

const inviteFields = (h: HtmlBuilder<Message>): Html =>
  Field.group(
    {
      children: [
        Field.view(
          {
            children: [
              Field.label({ forId: 'sheet-invite-email', children: ['Email'] }, h),
              Input.view({ id: 'sheet-invite-email', type: 'email', placeholder: 'name@company.com' }, h),
            ],
          },
          h,
        ),
        Field.view(
          {
            children: [
              Field.label({ forId: 'sheet-invite-note', children: ['Message'] }, h),
              Textarea.view({ id: 'sheet-invite-note', rows: 3, placeholder: 'Optional' }, h),
              Field.description({ children: ['Shown above the link in the invitation.'] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const defaultExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'Invite', ['Invite member'], h),
  sheet(
    model,
    'Invite',
    {
      hasDescription: true,
      content: (render) => [
        Sheet.header(
          {
            children: [
              Sheet.title({ render: render.title, children: ['Invite member'] }, h),
              Sheet.description(
                { render: render.description, children: ['We’ll email them a link to join the workspace.'] },
                h,
              ),
            ],
          },
          h,
        ),
        Sheet.body({ children: [inviteFields(h)] }, h),
        Sheet.footer({ children: [Button.view({ intent: 'primary', children: ['Send invite'] }, h)] }, h),
      ],
    },
    h,
  ),
];

const sizesExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex gap-2')],
    [
      trigger(model, 'SizeDefault', ['default'], h),
      simpleSheet(model, 'SizeDefault', 'Task details', 'Status, assignee and due date.', {}, h),
      trigger(model, 'SizeLg', ['lg'], h),
      simpleSheet(model, 'SizeLg', 'Keyboard shortcuts', 'Every shortcut, grouped by page.', { size: 'lg' }, h),
    ],
  );

const withoutCloseButtonExample = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  trigger(model, 'Filter', ['Filter'], h),
  sheet(
    model,
    'Filter',
    {
      isCloseButtonShown: false,
      content: (render) => [
        Sheet.header({ children: [Sheet.title({ render: render.title, children: ['Filter'] }, h)] }, h),
        Sheet.body({ children: [mutedText('Project, assignee and due date.', h)] }, h),
        Sheet.footer(
          { children: [Button.view({ intent: 'primary', attributes: render.closeButton, children: ['Apply'] }, h)] },
          h,
        ),
      ],
    },
    h,
  ),
];

const directionsExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex gap-2')],
    [
      trigger(model, 'Left', ['Left'], h),
      simpleSheet(model, 'Left', 'From the left', 'Navigation and folders.', { side: 'left' }, h),
      trigger(model, 'Right', ['Right'], h),
      simpleSheet(model, 'Right', 'From the right', 'Details of the selected task.', { side: 'right' }, h),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A side panel: the dialog surface at full height, for a task next to the page. Sheet.body scrolls; from sm the panel floats 8px in.',
      sections: [
        exampleSection({ title: 'Default', children: defaultExample(model, h) }, h),
        exampleSection(
          {
            title: 'Sizes',
            description: [
              code('size', h),
              ': ',
              code('default', h),
              ' 24rem · ',
              code('lg', h),
              ' 28rem from ',
              code('sm', h),
              ' up.',
            ],
            children: [sizesExample(model, h)],
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
            title: 'Directions',
            description: [code("side: 'right'", h), ' (the default) or ', code("'left'", h), '.'],
            children: [directionsExample(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

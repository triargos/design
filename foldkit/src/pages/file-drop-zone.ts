import { Array, Option, Schema } from 'effect';
import { File, Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as FileDropZone from '../pavo/file-drop-zone.ts';
import { icon } from '../pavo/icon.ts';

export const title = 'File Drop Zone';
export const description = 'A field surface you drop files on or click to pick them.';

export const Model = Schema.Struct({
  defaultZone: FileDropZone.Model,
  defaultFileNames: Schema.Array(Schema.String),
  compactZone: FileDropZone.Model,
  invalidZone: FileDropZone.Model,
  disabledZone: FileDropZone.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotDefaultZoneMessage: { message: FileDropZone.Message },
  GotCompactZoneMessage: { message: FileDropZone.Message },
  GotInvalidZoneMessage: { message: FileDropZone.Message },
  GotDisabledZoneMessage: { message: FileDropZone.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    defaultZone: FileDropZone.init({ id: 'file-drop-zone-default' }),
    defaultFileNames: [],
    compactZone: FileDropZone.init({ id: 'file-drop-zone-compact' }),
    invalidZone: FileDropZone.init({ id: 'file-drop-zone-invalid' }),
    disabledZone: FileDropZone.init({ id: 'file-drop-zone-disabled' }),
  },
});

const toDefaultZoneMessage = (message: FileDropZone.Message): Message => Message.GotDefaultZoneMessage({ message });
const toCompactZoneMessage = (message: FileDropZone.Message): Message => Message.GotCompactZoneMessage({ message });
const toInvalidZoneMessage = (message: FileDropZone.Message): Message => Message.GotInvalidZoneMessage({ message });
const toDisabledZoneMessage = (message: FileDropZone.Message): Message => Message.GotDisabledZoneMessage({ message });

const foldDefaultZoneOutMessage = FileDropZone.OutMessage.match<Update.Step<Model, Message>>({
  ReceivedFiles:
    ({ files }) =>
    (stepModel) => ({
      model: modifyFields(stepModel, { defaultFileNames: () => Array.map(files, File.name) }),
    }),
  RejectedNonFiles: () => (stepModel) => ({ model: stepModel }),
});

const foldStaticZoneOutMessage = FileDropZone.OutMessage.match<Update.Step<Model, Message>>({
  ReceivedFiles: () => (stepModel) => ({ model: stepModel }),
  RejectedNonFiles: () => (stepModel) => ({ model: stepModel }),
});

const foldDefaultZone = Update.foldChild({
  update: FileDropZone.update,
  read: (model: Model) => Option.some(model.defaultZone),
  write: (model: Model, nextDefaultZone: FileDropZone.Model) =>
    modifyFields(model, { defaultZone: () => nextDefaultZone }),
  toParentMessage: toDefaultZoneMessage,
  foldOutMessage: foldDefaultZoneOutMessage,
});

const foldCompactZone = Update.foldChild({
  update: FileDropZone.update,
  read: (model: Model) => Option.some(model.compactZone),
  write: (model: Model, nextCompactZone: FileDropZone.Model) =>
    modifyFields(model, { compactZone: () => nextCompactZone }),
  toParentMessage: toCompactZoneMessage,
  foldOutMessage: foldStaticZoneOutMessage,
});

const foldInvalidZone = Update.foldChild({
  update: FileDropZone.update,
  read: (model: Model) => Option.some(model.invalidZone),
  write: (model: Model, nextInvalidZone: FileDropZone.Model) =>
    modifyFields(model, { invalidZone: () => nextInvalidZone }),
  toParentMessage: toInvalidZoneMessage,
  foldOutMessage: foldStaticZoneOutMessage,
});

const foldDisabledZone = Update.foldChild({
  update: FileDropZone.update,
  read: (model: Model) => Option.some(model.disabledZone),
  write: (model: Model, nextDisabledZone: FileDropZone.Model) =>
    modifyFields(model, { disabledZone: () => nextDisabledZone }),
  toParentMessage: toDisabledZoneMessage,
  foldOutMessage: foldStaticZoneOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotDefaultZoneMessage: ({ message }) => foldDefaultZone(model, message),
    GotCompactZoneMessage: ({ message }) => foldCompactZone(model, message),
    GotInvalidZoneMessage: ({ message }) => foldInvalidZone(model, message),
    GotDisabledZoneMessage: ({ message }) => foldDisabledZone(model, message),
  });

const defaultBody = (h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.span(
    [h.Class('flex size-9 items-center justify-center rounded-full bg-card shadow-raised')],
    [icon('upload', { className: 'size-4 text-muted-foreground' })],
  ),
  h.div(
    [],
    [
      h.p([h.Class('text-body text-foreground')], ['Drop files here or choose them']),
      h.p([h.Class('text-caption text-muted-foreground')], ['PDF or images, up to 10 MB each']),
    ],
  ),
];

const defaultExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-md flex-col gap-2')],
    [
      FileDropZone.view(
        {
          model: model.defaultZone,
          toParentMessage: toDefaultZoneMessage,
          ariaLabel: 'Choose files',
          children: defaultBody(h),
        },
        h,
      ),
      ...Array.match(model.defaultFileNames, {
        onEmpty: () => [],
        onNonEmpty: (fileNames) => [
          h.p([h.Class('text-caption text-muted-foreground')], [Array.join(fileNames, ', ')]),
        ],
      }),
    ],
  );

const sizesExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  FileDropZone.view(
    {
      model: model.compactZone,
      toParentMessage: toCompactZoneMessage,
      size: 'sm',
      ariaLabel: 'Attach a file',
      className: 'w-64',
      children: [icon('paperclip', { className: 'size-4 shrink-0' }), 'Attach a file'],
    },
    h,
  );

const statesExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-md flex-col gap-4')],
    [
      h.div(
        [h.Class('flex flex-col gap-2')],
        [
          FileDropZone.view(
            {
              model: model.invalidZone,
              toParentMessage: toInvalidZoneMessage,
              isInvalid: true,
              ariaLabel: 'Choose files',
              children: defaultBody(h),
            },
            h,
          ),
          h.div(
            [
              h.Role('alert'),
              h.DataAttribute('slot', 'field-error'),
              h.Class('text-body font-normal text-destructive'),
            ],
            ['Add at least one invoice.'],
          ),
        ],
      ),
      FileDropZone.view(
        {
          model: model.disabledZone,
          toParentMessage: toDisabledZoneMessage,
          isDisabled: true,
          ariaLabel: 'Choose files',
          children: defaultBody(h),
        },
        h,
      ),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A field surface you drop files on or click to pick them. The default zone sits in a form; sm is a row with a dashed outline, so it does not read as a text field.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'Drag a file over it to see drag-over for real.',
            children: [defaultExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Sizes',
            description: [code("size: 'sm'", h), ': a row with a dashed outline, so it does not read as a text field.'],
            children: [sizesExample(model, h)],
          },
          h,
        ),
        exampleSection(
          { title: 'States', description: 'Invalid with its error, disabled.', children: [statesExample(model, h)] },
          h,
        ),
      ],
    },
    h,
  ),
);

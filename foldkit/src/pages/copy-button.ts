import { Array, Option, Record, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, foundationSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import type * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import * as CopyButton from '../pavo/copy-button.ts';
import { icon } from '../pavo/icon.ts';
import * as InputGroup from '../pavo/input-group.ts';
import * as Item from '../pavo/item.ts';

export const title = 'Copy Button';
export const description = 'Copies a value to the clipboard; the icon springs into a check.';

const INVITE_LINK = 'https://acme.example/invite/k3f9';
const API_KEY = 'sk_live_4f9a2b7dc21e';
const TOAST_TEXT = 'API key copied';

const MATRIX_SIZES: ReadonlyArray<Button.ButtonSize> = ['icon-sm', 'icon', 'icon-lg'];
const MATRIX_COLUMNS = ['ghost', 'raised', 'copied'] as const;
type MatrixColumn = (typeof MATRIX_COLUMNS)[number];

const matrixCopyId = (size: Button.ButtonSize, column: MatrixColumn): string => `matrix-${size}-${column}`;

const COPY_IDS = [
  'default',
  'with-text',
  'in-a-field',
  'next-to-a-value',
  'with-toast',
  'usage-api-key',
  ...Array.flatMap(MATRIX_SIZES, (size) => Array.map(MATRIX_COLUMNS, (column) => matrixCopyId(size, column))),
];

export const Model = Schema.Struct({
  copyButtons: Schema.Record(Schema.String, CopyButton.Model),
  maybeToast: Schema.Option(Schema.String),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotCopyButtonMessage: { copyId: Schema.String, message: CopyButton.Message },
});
export type Message = typeof Message.Type;

const initCopyButton = (copyId: string): CopyButton.Model => {
  const copyButton = CopyButton.init({ id: `copy-button-${copyId}` });
  return copyId.endsWith('-copied') ? modifyFields(copyButton, { isCopied: () => true }) : copyButton;
};

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    copyButtons: Record.fromIterableWith(COPY_IDS, (copyId) => [copyId, initCopyButton(copyId)]),
    maybeToast: Option.none(),
  },
});

const toCopyButtonMessage =
  (copyId: string) =>
  (message: CopyButton.Message): Message =>
    Message.GotCopyButtonMessage({ copyId, message });

const foldCopyButtonOutMessage = (copyId: string) =>
  CopyButton.OutMessage.match<Update.Step<Model, Message>>({
    Copied: () => (stepModel) => ({
      model: modifyFields(stepModel, {
        maybeToast: (maybeToast) => (copyId === 'with-toast' ? Option.some(TOAST_TEXT) : maybeToast),
      }),
    }),
  });

const foldCopyButton = Update.foldChildAt({
  update: CopyButton.update,
  readAt: (model: Model, copyId: string) => Record.get(model.copyButtons, copyId),
  writeAt: (model: Model, copyId: string, nextCopyButton: CopyButton.Model) =>
    modifyFields(model, { copyButtons: Record.set(copyId, nextCopyButton) }),
  toParentMessage: (copyId: string, message: CopyButton.Message) => toCopyButtonMessage(copyId)(message),
  foldOutMessage: (copyId: string) => foldCopyButtonOutMessage(copyId),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotCopyButtonMessage: ({ copyId, message }) => foldCopyButton(model, copyId, message),
  });

type CopyConfig = Omit<CopyButton.ViewConfig<Message>, 'model' | 'toParentMessage'>;

const copyButton = (model: Model, copyId: string, config: CopyConfig, h: HtmlBuilder<Message>): Html =>
  Option.match(Record.get(model.copyButtons, copyId), {
    onNone: () => null,
    onSome: (copyButtonModel) =>
      CopyButton.view({ model: copyButtonModel, toParentMessage: toCopyButtonMessage(copyId), ...config }, h),
  });

const inAField = (model: Model, h: HtmlBuilder<Message>): Html =>
  InputGroup.view(
    {
      className: 'max-w-md',
      children: [
        InputGroup.input(
          { id: 'copy-button-invite-link', value: INVITE_LINK, isReadOnly: true, ariaLabel: 'Invite link' },
          h,
        ),
        InputGroup.addon(
          {
            align: 'inline-end',
            children: [
              copyButton(
                model,
                'in-a-field',
                {
                  value: INVITE_LINK,
                  label: 'Copy invite link',
                  className: InputGroup.buttonVariants({ size: 'icon-xs' }),
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

const nextToAValue = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex items-center gap-2')],
    [
      h.span([h.Class('font-mono text-body font-medium')], ['INV-2024-0042']),
      copyButton(
        model,
        'next-to-a-value',
        { value: 'INV-2024-0042', label: 'Copy invoice number', size: 'icon-sm' },
        h,
      ),
    ],
  );

const withToast = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex items-center gap-related')],
    [
      copyButton(model, 'with-toast', { value: API_KEY, emphasis: 'raised', children: ['Copy API key'] }, h),
      ...Option.match(model.maybeToast, {
        onNone: () => [],
        onSome: (toast) => [h.span([h.Role('status'), h.Class('text-body text-muted-foreground')], [toast])],
      }),
    ],
  );

const matrixCell = (model: Model, size: Button.ButtonSize, column: MatrixColumn, h: HtmlBuilder<Message>): Html =>
  h.keyed('div')(
    column,
    [h.Class('flex min-w-0 items-center border-t border-border-subtle px-1 py-related last:pr-group')],
    [
      copyButton(
        model,
        matrixCopyId(size, column),
        { value: INVITE_LINK, size, ...(column === 'raised' ? { emphasis: 'raised' } : {}) },
        h,
      ),
    ],
  );

const sizeEmphasisMatrix = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.content(
          {
            className: 'overflow-x-auto',
            children: [
              h.div(
                [
                  h.Class('grid min-w-fit items-center gap-x-related'),
                  h.Style({ gridTemplateColumns: '8rem repeat(3, minmax(7.5rem, 1fr))' }),
                ],
                [
                  h.span([]),
                  ...Array.map(MATRIX_COLUMNS, (column) =>
                    h.keyed('span')(
                      column,
                      [h.Class('px-1 pt-group pb-related font-mono text-caption text-muted-foreground')],
                      [column],
                    ),
                  ),
                  ...Array.map(MATRIX_SIZES, (size) =>
                    h.keyed('div')(
                      size,
                      [h.Class('contents')],
                      [
                        h.div(
                          [h.Class('flex flex-col border-t border-border-subtle py-related pl-group')],
                          [h.span([h.Class('text-body font-medium')], [size])],
                        ),
                        ...Array.map(MATRIX_COLUMNS, (column) => matrixCell(model, size, column, h)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const usages = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.header({ children: [Card.title({ children: ['In a row'] }, h)] }, h),
        Card.content(
          {
            className: 'overflow-hidden',
            children: [
              Item.list(
                {
                  children: [
                    Item.view(
                      {
                        children: [
                          Item.media({ variant: 'icon', children: [icon('key')] }, h),
                          Item.content(
                            {
                              children: [
                                Item.title({ children: ['API key'] }, h),
                                Item.description({ className: 'font-mono', children: ['sk_live_4f9a…c21e'] }, h),
                              ],
                            },
                            h,
                          ),
                          Item.actions(
                            {
                              children: [
                                copyButton(model, 'usage-api-key', { value: API_KEY, label: 'Copy API key' }, h),
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
        'Copies a value to the clipboard; the icon springs into a check that draws itself, then springs back after two seconds. Reduced motion cross-fades. Icon-only and ghost by default, so it sits quietly next to what it copies. label names the icon-only button (default “Copy”); copiedLabel is announced after a copy (default “Copied”).',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'Icon-only and ghost, so it sits quietly next to what it copies. Click it to see the check.',
            children: [copyButton(model, 'default', { value: INVITE_LINK, label: 'Copy invite link' }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With text',
            description: [code('children: (isCopied) => …', h)],
            children: [
              copyButton(
                model,
                'with-text',
                {
                  value: 'JBSWY3DPEHPK3PXP',
                  emphasis: 'raised',
                  children: (isCopied) => [isCopied ? 'Copied' : 'Copy secret key'],
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'In a field',
            description: [code('InputGroup.buttonVariants', h), ' sizes it as a field action.'],
            children: [inAField(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Next to a value',
            description: [code("size: 'icon-sm'", h)],
            children: [nextToAValue(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With toast',
            description: [code('OutMessage.Copied', h), ', for a copy whose result is not next to the button.'],
            children: [withToast(model, h)],
          },
          h,
        ),
        foundationSection(
          {
            title: 'Size × emphasis',
            description: 'Any Button size and emphasis. The copied column is the real button, kept copied.',
            children: [sizeEmphasisMatrix(model, h)],
          },
          h,
        ),
        foundationSection({ title: 'Usages', children: [usages(model, h)] }, h),
      ],
    },
    h,
  ),
);

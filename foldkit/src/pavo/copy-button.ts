import { Duration, Effect, Number, Predicate, Schema } from 'effect';
import { Command, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import * as Button from './button.ts';
import { icon } from './icon.ts';
import * as IconSwap from './icon-swap.ts';
import type { Child, PartAttribute } from './part.ts';

const COPIED_DURATION = Duration.millis(2000);
const DEFAULT_LABEL = 'Copy';
const DEFAULT_COPIED_LABEL = 'Copied';

export const Model = Schema.Struct({
  id: Schema.String,
  copyCount: Schema.Number,
  isCopied: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedCopy: { value: Schema.String },
  SucceededCopyToClipboard: {},
  FailedCopyToClipboard: {},
  CompletedWaitCopiedDuration: { copyCount: Schema.Number },
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  Copied: {},
});
export type OutMessage = typeof OutMessage.Type;

export type InitConfig = Readonly<{ id: string }>;

export const init = ({ id }: InitConfig): Model => ({ id, copyCount: 0, isCopied: false });

const CopyToClipboard = Command.define('CopyToClipboard', {
  args: { value: Schema.String },
  messages: [Message.SucceededCopyToClipboard, Message.FailedCopyToClipboard],
  execute: ({ value }) =>
    Effect.tryPromise(() => navigator.clipboard.writeText(value)).pipe(
      Effect.as(Message.SucceededCopyToClipboard()),
      Effect.catch(() => Effect.succeed(Message.FailedCopyToClipboard())),
    ),
});

const WaitCopiedDuration = Command.define('WaitCopiedDuration', {
  args: { copyCount: Schema.Number },
  messages: [Message.CompletedWaitCopiedDuration],
  execute: ({ copyCount }) =>
    Effect.sleep(COPIED_DURATION).pipe(Effect.as(Message.CompletedWaitCopiedDuration({ copyCount }))),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.ReturnWithOutMessage<Model, Message, OutMessage>>(message, {
    ClickedCopy: ({ value }) => ({ model, commands: [CopyToClipboard({ value })] }),
    SucceededCopyToClipboard: () => {
      const nextCopyCount = Number.increment(model.copyCount);
      return {
        model: modifyFields(model, { copyCount: () => nextCopyCount, isCopied: () => true }),
        commands: [WaitCopiedDuration({ copyCount: nextCopyCount })],
        outMessage: OutMessage.Copied(),
      };
    },
    FailedCopyToClipboard: () => ({ model }),
    CompletedWaitCopiedDuration: ({ copyCount }) => ({
      model: modifyFields(model, { isCopied: (isCopied) => isCopied && copyCount !== model.copyCount }),
    }),
  });

export type ViewConfig<ParentMessage> = Button.ButtonStyle &
  Readonly<{
    model: Model;
    toParentMessage: (message: Message) => ParentMessage;
    value: string;
    label?: string;
    copiedLabel?: string;
    children?: ReadonlyArray<Child> | ((isCopied: boolean) => ReadonlyArray<Child>);
    isDisabled?: boolean;
    attributes?: ReadonlyArray<PartAttribute<ParentMessage>>;
  }>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    value,
    label = DEFAULT_LABEL,
    copiedLabel = DEFAULT_COPIED_LABEL,
    children,
    emphasis = 'ghost',
    size = children === undefined ? 'icon' : 'default',
    attributes = [],
    className,
    ...buttonStyle
  } = config;
  const { isCopied } = model;
  const text = Predicate.isFunction(children) ? children(isCopied) : children;

  return Button.view(
    {
      ...buttonStyle,
      emphasis,
      size,
      className,
      onClick: toParentMessage(Message.ClickedCopy({ value })),
      ...(text === undefined ? { ariaLabel: label } : {}),
      attributes: [
        ...(isCopied ? [h.DataAttribute('copied', '')] : []),
        ...attributes,
        h.DataAttribute('slot', 'copy-button'),
      ],
      children: [
        h.span(
          [h.AriaHidden(true), h.Class('grid *:col-start-1 *:row-start-1')],
          [
            IconSwap.view({ isShown: !isCopied, children: [icon('copy')] }),
            IconSwap.drawnCheck({ isShown: isCopied, className: 'text-success' }),
          ],
        ),
        ...(text ?? []),
        h.span([h.Role('status'), h.Class('sr-only')], [isCopied ? copiedLabel : '']),
      ],
    },
    h,
  );
};

import { Array, Effect, Match, Number, Option, Schema, String, pipe } from 'effect';
import { Command, type Update } from 'foldkit';
import * as Dom from 'foldkit/dom';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { cn } from './cn.ts';
import { inputSurfaceVariants } from './input.ts';

const SLOT_STAGGER_MS = 30;
const DIGIT_PATTERN = /^\d$/;

const Parity = Schema.Literals(['odd', 'even']);
type Parity = typeof Parity.Type;

const flip = (maybeParity: Option.Option<Parity>): Parity =>
  Option.exists(maybeParity, (parity) => parity === 'odd') ? 'even' : 'odd';

const Entry = Schema.Struct({ from: Schema.Number, to: Schema.Number, parity: Parity });
const Rejection = Schema.Struct({ index: Schema.Number, parity: Parity });

export const Model = Schema.Struct({
  id: Schema.String,
  length: Schema.Number,
  value: Schema.String,
  maybeEntry: Schema.Option(Entry),
  maybeRejection: Schema.Option(Rejection),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  TypedCharacter: { index: Schema.Number, character: Schema.String },
  RejectedCharacter: { index: Schema.Number },
  DeletedBackward: { index: Schema.Number },
  DeletedForward: { index: Schema.Number },
  PastedText: { index: Schema.Number, text: Schema.String },
  PressedNavigationKey: { index: Schema.Number },
  CompletedFocusSlot: {},
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  ChangedValue: { value: Schema.String, isComplete: Schema.Boolean },
});
export type OutMessage = typeof OutMessage.Type;

export type InitConfig = Readonly<{ id: string; length: number; value?: string }>;

export const init = ({ id, length, value = '' }: InitConfig): Model => ({
  id,
  length,
  value: String.slice(0, length)(value),
  maybeEntry: Option.none(),
  maybeRejection: Option.none(),
});

export const slotId = (id: string, index: number): string => (index === 0 ? id : `${id}-slot-${index}`);

const FocusSlot = Command.define('FocusSlot', {
  args: { id: Schema.String },
  messages: [Message.CompletedFocusSlot],
  execute: ({ id }) => Dom.focus(`#${CSS.escape(id)}`).pipe(Effect.ignore, Effect.as(Message.CompletedFocusSlot())),
});

const focusSlot = (model: Model, index: number) =>
  FocusSlot({ id: slotId(model.id, Number.clamp(index, { minimum: 0, maximum: model.length - 1 })) });

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const changedValue = (model: Model, nextValue: string): OutMessage =>
  OutMessage.ChangedValue({ value: nextValue, isComplete: nextValue.length === model.length });

const insertAt = (model: Model, index: number, text: string): UpdateReturn => {
  const position = Math.min(index, model.value.length);
  const nextValue = pipe(
    String.slice(0, position)(model.value) + text + String.slice(position + text.length)(model.value),
    String.slice(0, model.length),
  );
  const lastWritten = Math.min(position + text.length, model.length) - 1;
  return {
    model: modifyFields(model, {
      value: () => nextValue,
      maybeEntry: (maybeEntry) =>
        Option.some({ from: position, to: lastWritten, parity: flip(Option.map(maybeEntry, ({ parity }) => parity)) }),
      maybeRejection: () => Option.none(),
    }),
    commands: [focusSlot(model, lastWritten + 1)],
    outMessage: changedValue(model, nextValue),
  };
};

const removeAt = (model: Model, index: number, focusIndex: number): UpdateReturn => {
  const nextValue = String.slice(0, index)(model.value) + String.slice(index + 1)(model.value);
  return {
    model: modifyFields(model, {
      value: () => nextValue,
      maybeEntry: () => Option.none(),
      maybeRejection: () => Option.none(),
    }),
    commands: [focusSlot(model, focusIndex)],
    outMessage: changedValue(model, nextValue),
  };
};

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    TypedCharacter: ({ index, character }) => insertAt(model, index, character),
    RejectedCharacter: ({ index }) => ({
      model: modifyFields(model, {
        maybeEntry: () => Option.none(),
        maybeRejection: (maybeRejection) =>
          Option.some({ index, parity: flip(Option.map(maybeRejection, ({ parity }) => parity)) }),
      }),
    }),
    DeletedBackward: ({ index }) => {
      if (index < model.value.length) {
        return removeAt(model, index, index);
      } else if (index > 0) {
        return removeAt(model, Math.min(index, model.value.length) - 1, index - 1);
      } else {
        return { model };
      }
    },
    DeletedForward: ({ index }) => (index < model.value.length ? removeAt(model, index, index) : { model }),
    PastedText: ({ index, text }) => {
      const digits = pipe(
        text,
        String.split(''),
        Array.filter((character) => DIGIT_PATTERN.test(character)),
        Array.join(''),
      );
      return String.isEmpty(digits) ? { model } : insertAt(model, index, digits);
    },
    PressedNavigationKey: ({ index }) => ({ model, commands: [focusSlot(model, index)] }),
    CompletedFocusSlot: () => ({ model }),
  });

export const reset = (model: Model): Update.Return<Model, Message> => ({
  model: modifyFields(model, {
    value: () => '',
    maybeEntry: () => Option.none(),
    maybeRejection: () => Option.none(),
  }),
  commands: [focusSlot(model, 0)],
});

export const focus = (model: Model): Update.Return<Model, Message> => ({
  model,
  commands: [focusSlot(model, model.value.length)],
});

export const DEFAULT_SLOT_LABEL = (position: number, length: number): string => `Character ${position} of ${length}`;

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  groups?: ReadonlyArray<number>;
  isMasked?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  ariaLabel?: string;
  slotLabel?: (position: number, length: number) => string;
  name?: string;
  className?: string;
}>;

const slotIndexes = (groups: ReadonlyArray<number>): ReadonlyArray<ReadonlyArray<number>> =>
  Array.reduce(groups, Array.empty<ReadonlyArray<number>>(), (rows, size) => {
    const start = Array.reduce(rows, 0, (count, row) => count + row.length);
    return [...rows, Array.makeBy(size, (offset) => start + offset)];
  });

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    groups = [model.length],
    isMasked = false,
    isInvalid = false,
    isReadOnly = false,
    isDisabled = false,
    ariaLabel,
    slotLabel = DEFAULT_SLOT_LABEL,
    name,
    className,
  } = config;
  const { id, length, value, maybeEntry, maybeRejection } = model;
  const isComplete = value.length === length;
  const isInteractive = !isReadOnly && !isDisabled;

  const handleBeforeInput =
    (index: number) =>
    (inputType: string, maybeData: Option.Option<string>): Option.Option<ParentMessage> =>
      Match.value(inputType).pipe(
        Match.withReturnType<Option.Option<Message>>(),
        Match.when('insertText', () =>
          Option.map(maybeData, (data) => {
            const character = String.slice(-1)(data);
            return DIGIT_PATTERN.test(character)
              ? Message.TypedCharacter({ index, character })
              : Message.RejectedCharacter({ index });
          }),
        ),
        Match.when('deleteContentBackward', () => Option.some(Message.DeletedBackward({ index }))),
        Match.when('deleteContentForward', () => Option.some(Message.DeletedForward({ index }))),
        Match.whenOr('insertReplacementText', 'insertFromDrop', 'insertFromPaste', () =>
          Option.map(maybeData, (text) => Message.PastedText({ index, text })),
        ),
        Match.orElse(() => Option.none()),
        Option.map(toParentMessage),
      );

  const handleKeyDown =
    (index: number) =>
    (key: string): Option.Option<ParentMessage> =>
      Match.value(key).pipe(
        Match.withReturnType<Option.Option<number>>(),
        Match.when('ArrowLeft', () => Option.some(index - 1)),
        Match.when('ArrowRight', () => Option.some(index + 1)),
        Match.when('Home', () => Option.some(0)),
        Match.when('End', () => Option.some(length - 1)),
        Match.orElse(() => Option.none()),
        Option.map((nextIndex) => toParentMessage(Message.PressedNavigationKey({ index: nextIndex }))),
      );

  const slotNameAttributes = (index: number) => {
    if (index > 0) {
      return [h.AriaLabel(slotLabel(index + 1, length))];
    } else if (ariaLabel === undefined) {
      return [];
    } else {
      return [h.AriaLabel(ariaLabel)];
    }
  };

  const slot = (index: number): Html => {
    const character = String.charAt(index)(value).pipe(Option.getOrElse(() => ''));
    const isFilled = !String.isEmpty(character);
    const maybeEnteredParity = Option.flatMap(maybeEntry, ({ from, to, parity }) =>
      index >= from && index <= to ? Option.some({ parity, delay: (index - from) * SLOT_STAGGER_MS }) : Option.none(),
    );
    const maybeRejectedParity = Option.flatMap(maybeRejection, (rejection) =>
      rejection.index === index ? Option.some(rejection.parity) : Option.none(),
    );
    const isSlotInvalid = isInvalid && !isDisabled && (isComplete || !isFilled);

    return h.keyed('input')(index, [
      h.Id(slotId(id, index)),
      h.Type(isMasked ? 'password' : 'text'),
      h.Attribute('inputmode', 'numeric'),
      h.Attribute('autocomplete', index === 0 ? 'one-time-code' : 'off'),
      h.DataAttribute('slot', 'input-otp-slot'),
      h.Value(character),
      ...slotNameAttributes(index),
      ...(isSlotInvalid ? [h.AriaInvalid(true)] : []),
      ...(isDisabled ? [h.Disabled(true), h.DataAttribute('disabled', '')] : []),
      ...(isReadOnly ? [h.Readonly(true), h.DataAttribute('readonly', '')] : []),
      ...(isFilled ? [h.DataAttribute('filled', '')] : []),
      ...Option.match(maybeEnteredParity, {
        onNone: () => [],
        onSome: ({ parity, delay }) => [h.DataAttribute('entered', parity), h.Style({ animationDelay: `${delay}ms` })],
      }),
      ...Option.match(maybeRejectedParity, {
        onNone: () => [],
        onSome: (parity) => [h.DataAttribute('rejected', parity)],
      }),
      ...(isInteractive
        ? [
            h.OnBeforeInputPreventDefault(handleBeforeInput(index)),
            h.OnPastePreventDefault((text) => Option.some(toParentMessage(Message.PastedText({ index, text })))),
          ]
        : []),
      ...(isDisabled ? [] : [h.OnKeyDownPreventDefault(handleKeyDown(index))]),
      h.Class(
        cn(
          inputSurfaceVariants({ scope: 'self' }),
          'relative size-control-lg min-w-0 shrink p-0 text-center text-control text-foreground tabular-nums',
          'pointer-coarse:size-11 pointer-coarse:text-[1rem]',
          'aria-invalid:text-destructive',
          'selection:bg-transparent focus-visible:z-10',
          'data-[entered=even]:animate-otp-fill-even data-[entered=odd]:animate-otp-fill-odd',
          'data-[rejected=even]:animate-otp-reject-even data-[rejected=odd]:animate-otp-reject-odd',
          'motion-reduce:animate-none',
        ),
      ),
    ]);
  };

  const separator = (groupIndex: number): Html =>
    h.keyed('div')(`separator-${groupIndex}`, [
      h.Role('separator'),
      h.DataAttribute('slot', 'input-otp-separator'),
      h.Class('mx-1 h-0.5 w-3 shrink-0 rounded-full bg-border'),
    ]);

  return h.div(
    [
      h.Role('group'),
      h.DataAttribute('slot', 'input-otp'),
      ...(isInvalid ? [h.DataAttribute('invalid', '')] : []),
      ...(isComplete ? [h.DataAttribute('complete', '')] : []),
      h.Class(
        cn(
          'flex max-w-full items-center gap-related',
          'data-invalid:animate-otp-shake motion-reduce:animate-none',
          className,
        ),
      ),
    ],
    [
      ...Array.flatMap(slotIndexes(groups), (indexes, groupIndex) => [
        ...(groupIndex === 0 ? [] : [separator(groupIndex)]),
        ...Array.map(indexes, slot),
      ]),
      ...(name === undefined ? [] : [h.input([h.Type('hidden'), h.Name(name), h.Value(value)])]),
    ],
  );
};

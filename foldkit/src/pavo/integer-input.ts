import { Array, Duration, Effect, Match, Number, Option, Schema, String, pipe } from 'effect';
import { Command, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { defineTaggedUnion } from 'foldkit/schema';
import { modifyFields } from 'foldkit/struct';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import { inputSurfaceVariants } from './input.ts';

const HOLD_DELAY = 400;
const REPEAT_START = 120;
const REPEAT_MIN = 40;
const REPEAT_ACCELERATION = 0.85;
const SHAKE_DURATION = 200;
const LEFT_MOUSE_BUTTON = 0;
const DIGIT_PATTERN = /^\d+$/;

const DEFAULT_DECREMENT_LABEL = 'Decrease';
const DEFAULT_INCREMENT_LABEL = 'Increase';

const Direction = Schema.Literals(['None', 'Up', 'Down']);
type Direction = typeof Direction.Type;

const HoldState = defineTaggedUnion({
  Idle: {},
  Holding: { delta: Schema.Number, holdId: Schema.Number, hasRepeated: Schema.Boolean },
  SwallowingClick: {},
});

export const Model = Schema.Struct({
  id: Schema.String,
  value: Schema.Number,
  maybeMax: Schema.Option(Schema.Number),
  maybeDraft: Schema.Option(Schema.String),
  direction: Direction,
  holdState: HoldState,
  holdCount: Schema.Number,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  FocusedField: {},
  BlurredField: {},
  ChangedText: { text: Schema.String },
  RejectedCharacter: {},
  PressedArrowKey: { delta: Schema.Number },
  PressedStepper: { delta: Schema.Number },
  ReleasedStepper: {},
  ClickedStepper: { delta: Schema.Number },
  CompletedWaitHold: { holdId: Schema.Number, nextDelay: Schema.Number },
  CompletedSelectText: {},
  CompletedSyncText: {},
  CompletedShake: {},
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  ChangedValue: { value: Schema.Number },
});
export type OutMessage = typeof OutMessage.Type;

export type InitConfig = Readonly<{ id: string; value: number; max?: number }>;

export const init = ({ id, value, max }: InitConfig): Model => ({
  id,
  value,
  maybeMax: Option.fromNullishOr(max),
  maybeDraft: Option.none(),
  direction: 'None',
  holdState: HoldState.Idle(),
  holdCount: 0,
});

const controlId = (id: string): string => `${id}-control`;
const numberId = (id: string): string => `${id}-number`;

const findElement = <A extends HTMLElement>(id: string, guard: (element: Element) => element is A) =>
  Option.liftPredicate(document.getElementById(id), (element): element is A => element !== null && guard(element));

const isInputElement = (element: Element): element is HTMLInputElement => element instanceof HTMLInputElement;
const isHtmlElement = (element: Element): element is HTMLElement => element instanceof HTMLElement;

const SelectText = Command.define('SelectText', {
  args: { id: Schema.String },
  messages: [Message.CompletedSelectText],
  execute: ({ id }) =>
    Effect.sleep(Duration.zero).pipe(
      Effect.andThen(
        Effect.sync(() => {
          const maybeInput = findElement(id, isInputElement);
          if (Option.isSome(maybeInput) && document.activeElement === maybeInput.value) {
            maybeInput.value.setSelectionRange(0, maybeInput.value.value.length);
          }
        }),
      ),
      Effect.as(Message.CompletedSelectText()),
    ),
});

const SyncText = Command.define('SyncText', {
  args: { id: Schema.String, text: Schema.String },
  messages: [Message.CompletedSyncText],
  execute: ({ id, text }) =>
    Effect.sync(() => {
      const maybeInput = findElement(id, isInputElement);
      if (Option.isSome(maybeInput) && maybeInput.value.value !== text) {
        maybeInput.value.value = text;
      }
    }).pipe(Effect.as(Message.CompletedSyncText())),
});

const Shake = Command.define('Shake', {
  args: { id: Schema.String },
  messages: [Message.CompletedShake],
  execute: ({ id }) =>
    Effect.sync(() => {
      const maybeNumber = findElement(id, isHtmlElement);
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (Option.isSome(maybeNumber) && !isReducedMotion) {
        maybeNumber.value.animate(
          { translate: ['0', '-3px', '3px', '0'] },
          { duration: SHAKE_DURATION, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        );
      }
    }).pipe(Effect.as(Message.CompletedShake())),
});

const WaitHold = Command.define('WaitHold', {
  args: { holdId: Schema.Number, delay: Schema.Number, nextDelay: Schema.Number },
  messages: [Message.CompletedWaitHold],
  execute: ({ holdId, delay, nextDelay }) =>
    Effect.sleep(Duration.millis(delay)).pipe(Effect.as(Message.CompletedWaitHold({ holdId, nextDelay }))),
});

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const clampValue = (model: Model, value: number): number =>
  Math.max(0, Option.match(model.maybeMax, { onNone: () => value, onSome: (max) => Math.min(value, max) }));

const directionOf = (delta: number): Direction => {
  if (delta > 0) {
    return 'Up';
  } else if (delta < 0) {
    return 'Down';
  } else {
    return 'None';
  }
};

const shake = (model: Model) => Shake({ id: numberId(model.id) });

const step = (model: Model, delta: number): Option.Option<UpdateReturn> => {
  const nextValue = clampValue(model, model.value + delta);
  if (nextValue === model.value) {
    return Option.none();
  } else {
    return Option.some({
      model: modifyFields(model, {
        value: () => nextValue,
        direction: () => directionOf(nextValue - model.value),
        maybeDraft: Option.map(() => globalThis.String(nextValue)),
      }),
      outMessage: OutMessage.ChangedValue({ value: nextValue }),
    });
  }
};

const stepOrShake = (model: Model, delta: number): UpdateReturn =>
  Option.getOrElse(step(model, delta), () => ({ model, commands: [shake(model)] }));

const changeText = (model: Model, text: string): UpdateReturn => {
  const digits = pipe(text, String.replace(/\D/g, ''), String.replace(/^0+(?=\d)/, ''));

  if (String.isEmpty(digits)) {
    return {
      model: modifyFields(model, { maybeDraft: () => Option.some(''), value: () => 0, direction: () => 'None' }),
      commands: [SyncText({ id: controlId(model.id), text: '' })],
      ...(model.value === 0 ? {} : { outMessage: OutMessage.ChangedValue({ value: 0 }) }),
    };
  }

  const typedValue = globalThis.Number(digits);
  const nextValue = clampValue(model, typedValue);
  const nextDraft = globalThis.String(nextValue);
  return {
    model: modifyFields(model, {
      maybeDraft: () => Option.some(nextDraft),
      value: () => nextValue,
      direction: () => 'None',
    }),
    commands: [
      SyncText({ id: controlId(model.id), text: nextDraft }),
      ...(nextValue === typedValue ? [] : [shake(model)]),
    ],
    ...(nextValue === model.value ? {} : { outMessage: OutMessage.ChangedValue({ value: nextValue }) }),
  };
};

const tickHold = (model: Model, holdId: number, nextDelay: number): UpdateReturn => {
  const { holdState } = model;
  if (holdState._tag !== 'Holding' || holdState.holdId !== holdId) {
    return { model };
  }

  const repeatedModel = modifyFields(model, {
    holdState: () => HoldState.Holding({ delta: holdState.delta, holdId, hasRepeated: true }),
  });
  return Option.match(step(repeatedModel, holdState.delta), {
    onNone: () => ({ model: repeatedModel, commands: [shake(model)] }),
    onSome: (stepped) => ({
      ...stepped,
      commands: [
        WaitHold({
          holdId,
          delay: nextDelay,
          nextDelay: Math.max(REPEAT_MIN, nextDelay * REPEAT_ACCELERATION),
        }),
      ],
    }),
  });
};

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    FocusedField: () => ({
      model: modifyFields(model, { maybeDraft: () => Option.some(globalThis.String(model.value)) }),
      commands: [SelectText({ id: controlId(model.id) })],
    }),
    BlurredField: () => ({ model: modifyFields(model, { maybeDraft: () => Option.none() }) }),
    ChangedText: ({ text }) => changeText(model, text),
    RejectedCharacter: () => ({ model }),
    PressedArrowKey: ({ delta }) => stepOrShake(model, delta),
    PressedStepper: ({ delta }) => {
      const holdId = Number.increment(model.holdCount);
      return {
        model: modifyFields(model, {
          holdCount: () => holdId,
          holdState: () => HoldState.Holding({ delta, holdId, hasRepeated: false }),
        }),
        commands: [WaitHold({ holdId, delay: HOLD_DELAY, nextDelay: REPEAT_START })],
      };
    },
    ReleasedStepper: () => ({
      model: modifyFields(model, {
        holdState: (holdState) => {
          if (holdState._tag !== 'Holding') {
            return holdState;
          } else if (holdState.hasRepeated) {
            return HoldState.SwallowingClick();
          } else {
            return HoldState.Idle();
          }
        },
      }),
    }),
    ClickedStepper: ({ delta }) =>
      Match.value(model.holdState).pipe(
        Match.withReturnType<UpdateReturn>(),
        Match.tag('SwallowingClick', () => ({
          model: modifyFields(model, { holdState: () => HoldState.Idle() }),
        })),
        Match.orElse(() => stepOrShake(modifyFields(model, { holdState: () => HoldState.Idle() }), delta)),
      ),
    CompletedWaitHold: ({ holdId, nextDelay }) => tickHold(model, holdId, nextDelay),
    CompletedSelectText: () => ({ model }),
    CompletedSyncText: () => ({ model }),
    CompletedShake: () => ({ model }),
  });

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  unit?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  decrementLabel?: string;
  incrementLabel?: string;
  isDisabled?: boolean;
  name?: string;
  className?: string;
}>;

const rollingNumber = <ParentMessage>(text: string, direction: Direction, h: HtmlBuilder<ParentMessage>): Html =>
  h.span(
    [
      h.AriaHidden(true),
      h.DataAttribute('direction', direction),
      h.Class('group/roll pointer-events-none absolute inset-0 flex flex-row-reverse items-center justify-start'),
    ],
    Array.map(Array.reverse(String.split('')(text)), (digit, place) =>
      h.keyed('span')(
        place,
        [h.Class('grid')],
        [
          h.keyed('span')(
            digit,
            [
              h.Class(
                cn(
                  'col-start-1 row-start-1 transition-[translate,opacity] duration-feedback ease-enter motion-reduce:transition-none',
                  'group-data-[direction=Up]/roll:starting:translate-y-full group-data-[direction=Up]/roll:starting:opacity-0',
                  'group-data-[direction=Down]/roll:starting:-translate-y-full group-data-[direction=Down]/roll:starting:opacity-0',
                ),
              ),
            ],
            [digit],
          ),
        ],
      ),
    ),
  );

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    unit,
    ariaLabel,
    ariaLabelledBy,
    decrementLabel = DEFAULT_DECREMENT_LABEL,
    incrementLabel = DEFAULT_INCREMENT_LABEL,
    isDisabled = false,
    name,
    className,
  } = config;
  const { id, value, maybeMax, maybeDraft, direction } = model;
  const isEditing = Option.isSome(maybeDraft);
  const text = Option.getOrElse(maybeDraft, () => globalThis.String(value));
  const isAtMin = value <= 0;
  const isAtMax = Option.exists(maybeMax, (max) => value >= max);

  const stepper = (delta: number, label: string, isAtLimit: boolean, iconName: 'minus' | 'plus'): Html =>
    Button.view(
      {
        size: 'icon',
        ariaLabel: label,
        isDisabled,
        className: '[-webkit-touch-callout:none] aria-disabled:text-disabled-foreground',
        onClick: toParentMessage(Message.ClickedStepper({ delta })),
        attributes: [
          ...(!isDisabled && isAtLimit ? [h.AriaDisabled(true)] : []),
          ...(isDisabled
            ? []
            : [
                h.OnPointerDown((_pointerType, button) =>
                  button === LEFT_MOUSE_BUTTON
                    ? Option.some(toParentMessage(Message.PressedStepper({ delta })))
                    : Option.none(),
                ),
                h.OnPointerUp(() => Option.some(toParentMessage(Message.ReleasedStepper()))),
                h.OnPointerLeave(() => Option.some(toParentMessage(Message.ReleasedStepper()))),
              ]),
        ],
        children: [iconName === 'minus' ? icon('minus') : icon('plus')],
      },
      h,
    );

  const handleKeyDown = (key: string): Option.Option<ParentMessage> =>
    Match.value(key).pipe(
      Match.withReturnType<Option.Option<number>>(),
      Match.when('ArrowUp', () => Option.some(1)),
      Match.when('ArrowDown', () => Option.some(-1)),
      Match.orElse(() => Option.none()),
      Option.map((delta) => toParentMessage(Message.PressedArrowKey({ delta }))),
    );

  const handleBeforeInput = (inputType: string, maybeData: Option.Option<string>): Option.Option<ParentMessage> =>
    inputType === 'insertText' && Option.exists(maybeData, (data) => !DIGIT_PATTERN.test(data))
      ? Option.some(toParentMessage(Message.RejectedCharacter()))
      : Option.none();

  return h.div(
    [
      h.DataAttribute('slot', 'integer-input'),
      h.Role('group'),
      h.Class(cn('flex w-full min-w-0 items-center gap-control-gap', className)),
    ],
    [
      stepper(-1, decrementLabel, isAtMin, 'minus'),
      h.label(
        [
          h.DataAttribute('slot', 'integer-input-field'),
          h.For(controlId(id)),
          h.Class(
            cn(
              inputSurfaceVariants({ scope: 'group' }),
              'flex h-control min-w-0 flex-1 cursor-text items-center justify-center gap-control-gap px-field-pad text-control max-md:text-[1rem]',
            ),
          ),
        ],
        [
          h.span(
            [h.Id(numberId(id)), h.Class('flex h-full items-center gap-control-gap')],
            [
              h.span(
                [
                  h.Class(
                    cn(
                      'relative h-full overflow-clip font-medium tabular-nums',
                      !isEditing && 'transition-[width] duration-feedback ease-enter motion-reduce:transition-none',
                    ),
                  ),
                  h.Style({ width: `${Math.max(1, text.length)}ch` }),
                ],
                [
                  h.input([
                    h.Id(controlId(id)),
                    h.DataAttribute('slot', 'input-group-control'),
                    h.Type('text'),
                    h.Attribute('inputmode', 'numeric'),
                    h.Attribute('pattern', '[0-9]*'),
                    h.Attribute('autocomplete', 'off'),
                    h.Role('spinbutton'),
                    h.AriaValuenow(value),
                    h.AriaValuemin(0),
                    ...Option.match(maybeMax, { onNone: () => [], onSome: (max) => [h.AriaValuemax(max)] }),
                    ...(unit === undefined ? [] : [h.AriaValuetext(`${value} ${unit}`)]),
                    ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
                    ...(ariaLabelledBy === undefined ? [] : [h.AriaLabelledBy(ariaLabelledBy)]),
                    ...(name === undefined ? [] : [h.Name(name)]),
                    h.Value(text),
                    ...(isDisabled
                      ? [h.Disabled(true)]
                      : [
                          h.OnFocus(toParentMessage(Message.FocusedField())),
                          h.OnBlur(toParentMessage(Message.BlurredField())),
                          h.OnInput((nextText) => toParentMessage(Message.ChangedText({ text: nextText }))),
                          h.OnBeforeInputPreventDefault(handleBeforeInput),
                          h.OnKeyDownPreventDefault(handleKeyDown),
                        ]),
                    h.Class(
                      cn(
                        'h-full w-full bg-transparent p-0 text-right outline-none disabled:cursor-not-allowed',
                        !isEditing && 'text-transparent',
                      ),
                    ),
                  ]),
                  ...(isEditing ? [] : [rollingNumber(text, direction, h)]),
                ],
              ),
              ...(unit === undefined ? [] : [h.span([h.Class('text-muted-foreground select-none')], [unit])]),
            ],
          ),
        ],
      ),
      stepper(1, incrementLabel, isAtMax, 'plus'),
    ],
  );
};

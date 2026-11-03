import { DatePicker } from '@foldkit/ui';
import { Array, Duration, Effect, Match, Option, Schema, String, pipe } from 'effect';
import { Command, Update } from 'foldkit';
import * as FoldkitCalendar from 'foldkit/calendar';
import * as Dom from 'foldkit/dom';
import type { CalendarDate } from 'foldkit/calendar';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { childAttributes } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { buttonVariants } from './button.ts';
import * as Calendar from './calendar.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import * as Input from './input.ts';
import * as InputGroup from './input-group.ts';
import * as Popover from './popover.ts';

export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_CHOOSE_DATE_LABEL = 'Choose date';

export const FieldKind = Schema.Literals(['Date', 'Time']);
export type FieldKind = typeof FieldKind.Type;

export const SegmentType = Schema.Literals(['year', 'month', 'day', 'hour', 'minute', 'dayPeriod']);
export type SegmentType = typeof SegmentType.Type;

export const Segments = Schema.Struct({
  year: Schema.Option(Schema.Number),
  month: Schema.Option(Schema.Number),
  day: Schema.Option(Schema.Number),
  hour: Schema.Option(Schema.Number),
  minute: Schema.Option(Schema.Number),
  isPm: Schema.Option(Schema.Boolean),
});
export type Segments = typeof Segments.Type;

export const TimeOfDay = Schema.Struct({ hour: Schema.Number, minute: Schema.Number });
export type TimeOfDay = typeof TimeOfDay.Type;

export const Model = Schema.Struct({
  id: Schema.String,
  kind: FieldKind,
  locale: Schema.String,
  segments: Segments,
  committedSegments: Segments,
  typedDigits: Schema.String,
  maybeFocusedSegment: Schema.Option(SegmentType),
  picker: DatePicker.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  PressedSegmentKey: { segment: SegmentType, key: Schema.String },
  FocusedSegment: { segment: SegmentType },
  BlurredSegment: {},
  CompletedCheckFocusInField: { isInField: Schema.Boolean },
  CompletedFocusSegment: {},
  PressedOpenPicker: {},
  GotPickerMessage: { message: DatePicker.Message },
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  ChangedDate: { maybeDate: Schema.Option(FoldkitCalendar.CalendarDate) },
  ChangedTime: { maybeTime: Schema.Option(TimeOfDay) },
});
export type OutMessage = typeof OutMessage.Type;

const EMPTY_SEGMENTS: Segments = {
  year: Option.none(),
  month: Option.none(),
  day: Option.none(),
  hour: Option.none(),
  minute: Option.none(),
  isPm: Option.none(),
};

const dateSegments = (maybeDate: Option.Option<CalendarDate>): Segments =>
  Option.match(maybeDate, {
    onNone: () => EMPTY_SEGMENTS,
    onSome: ({ year, month, day }) => ({
      ...EMPTY_SEGMENTS,
      year: Option.some(year),
      month: Option.some(month),
      day: Option.some(day),
    }),
  });

const HOURS_PER_HALF_DAY = 12;

const timeSegments = (maybeTime: Option.Option<TimeOfDay>): Segments =>
  Option.match(maybeTime, {
    onNone: () => EMPTY_SEGMENTS,
    onSome: ({ hour, minute }) => ({
      ...EMPTY_SEGMENTS,
      hour: Option.some(hour),
      minute: Option.some(minute),
      isPm: Option.some(hour >= HOURS_PER_HALF_DAY),
    }),
  });

export type InitConfig = Readonly<{ id: string; today: CalendarDate; locale?: string | undefined }>;

const initModel = (
  kind: FieldKind,
  { id, today, locale = DEFAULT_LOCALE }: InitConfig,
  segments: Segments,
  maybeViewDate: Option.Option<CalendarDate>,
): Model => ({
  id,
  kind,
  locale,
  segments,
  committedSegments: segments,
  typedDigits: '',
  maybeFocusedSegment: Option.none(),
  picker: DatePicker.init({
    id: `${id}-picker`,
    today,
    isAnimated: true,
    locale: Calendar.localeConfig(locale),
    ...Option.match(maybeViewDate, { onNone: () => ({}), onSome: (initialViewDate) => ({ initialViewDate }) }),
  }),
});

export const init = (config: InitConfig & Readonly<{ maybeDate: Option.Option<CalendarDate> }>): Model =>
  initModel('Date', config, dateSegments(config.maybeDate), config.maybeDate);

export const initTime = (config: InitConfig & Readonly<{ maybeTime: Option.Option<TimeOfDay> }>): Model =>
  initModel('Time', config, timeSegments(config.maybeTime), Option.none());

type Part = Readonly<{ _tag: 'Segment'; segment: SegmentType }> | Readonly<{ _tag: 'Literal'; text: string }>;

const SAMPLE_DATE = Date.UTC(2025, 2, 14, 9, 30);
const NARROW_NO_BREAK_SPACE = /\u202f/g;

const isSegmentType = (type: string): type is SegmentType =>
  Array.contains(['year', 'month', 'day', 'hour', 'minute', 'dayPeriod'], type);

export const isTwelveHour = (locale: string): boolean => {
  const { hourCycle } = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
  return hourCycle === 'h12' || hourCycle === 'h11';
};

const layout = (kind: FieldKind, locale: string): ReadonlyArray<Part> => {
  const options: Intl.DateTimeFormatOptions =
    kind === 'Date'
      ? { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }
      : { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
  return Array.map(new Intl.DateTimeFormat(locale, options).formatToParts(SAMPLE_DATE), (part): Part =>
    isSegmentType(part.type)
      ? { _tag: 'Segment', segment: part.type }
      : { _tag: 'Literal', text: part.value.replace(NARROW_NO_BREAK_SPACE, ' ') },
  );
};

const segmentOrder = (kind: FieldKind, locale: string): ReadonlyArray<SegmentType> =>
  Array.flatMap(layout(kind, locale), (part) => (part._tag === 'Segment' ? [part.segment] : []));

type Bounds = Readonly<{ min: number; max: number; digits: number }>;

const MAX_YEAR = 9999;
const MIN_COMPLETE_YEAR = 1000;
const MAX_DAY = 31;
const MAX_MINUTE = 59;
const LAST_HOUR = 23;

const boundsOf = (model: Model, segment: SegmentType): Bounds =>
  Match.value(segment).pipe(
    Match.withReturnType<Bounds>(),
    Match.when('year', () => ({ min: 1, max: MAX_YEAR, digits: 4 })),
    Match.when('month', () => ({ min: 1, max: 12, digits: 2 })),
    Match.when('day', () => ({
      min: 1,
      max: pipe(
        Option.all([model.segments.year, model.segments.month]),
        Option.match({
          onNone: () => MAX_DAY,
          onSome: ([year, month]) => FoldkitCalendar.daysInMonth(year, month),
        }),
      ),
      digits: 2,
    })),
    Match.when('hour', () =>
      isTwelveHour(model.locale) ? { min: 1, max: 12, digits: 2 } : { min: 0, max: LAST_HOUR, digits: 2 },
    ),
    Match.when('minute', () => ({ min: 0, max: MAX_MINUTE, digits: 2 })),
    Match.when('dayPeriod', () => ({ min: 0, max: 1, digits: 1 })),
    Match.exhaustive,
  );

const displayHour = (hour: number, isTwelve: boolean): number => {
  if (!isTwelve) {
    return hour;
  } else {
    const halfDayHour = hour % HOURS_PER_HALF_DAY;
    return halfDayHour === 0 ? HOURS_PER_HALF_DAY : halfDayHour;
  }
};

const fromDisplayHour = (displayed: number, isPm: boolean, isTwelve: boolean): number =>
  isTwelve ? (displayed % HOURS_PER_HALF_DAY) + (isPm ? HOURS_PER_HALF_DAY : 0) : displayed;

const segmentValue = (model: Model, segment: SegmentType): Option.Option<number> =>
  Match.value(segment).pipe(
    Match.withReturnType<Option.Option<number>>(),
    Match.when('hour', () => Option.map(model.segments.hour, (hour) => displayHour(hour, isTwelveHour(model.locale)))),
    Match.when('dayPeriod', () => Option.map(model.segments.isPm, (isPm) => (isPm ? 1 : 0))),
    Match.orElse((other) => model.segments[other]),
  );

const withSegmentValue = (model: Model, segment: SegmentType, maybeValue: Option.Option<number>): Segments => {
  const isTwelve = isTwelveHour(model.locale);
  const isPm = Option.getOrElse(model.segments.isPm, () => false);
  return Match.value(segment).pipe(
    Match.withReturnType<Segments>(),
    Match.when('hour', () => ({
      ...model.segments,
      hour: Option.map(maybeValue, (displayed) => fromDisplayHour(displayed, isPm, isTwelve)),
    })),
    Match.when('dayPeriod', () => {
      const maybeIsPm = Option.map(maybeValue, (value) => value === 1);
      return {
        ...model.segments,
        isPm: maybeIsPm,
        hour: Option.map(model.segments.hour, (hour) =>
          fromDisplayHour(
            displayHour(hour, isTwelve),
            Option.getOrElse(maybeIsPm, () => false),
            isTwelve,
          ),
        ),
      };
    }),
    Match.orElse((other) => ({ ...model.segments, [other]: maybeValue })),
  );
};

const steppedValue = (bounds: Bounds, maybeValue: Option.Option<number>, step: 1 | -1): number =>
  Option.match(maybeValue, {
    onNone: () => (step === 1 ? bounds.min : bounds.max),
    onSome: (value) => {
      const next = value + step;
      if (next > bounds.max) {
        return bounds.min;
      } else if (next < bounds.min) {
        return bounds.max;
      } else {
        return next;
      }
    },
  });

const maybeCompleteDate = (segments: Segments): Option.Option<CalendarDate> =>
  pipe(
    Option.all([segments.year, segments.month, segments.day]),
    Option.filter(([year]) => year >= MIN_COMPLETE_YEAR),
    Option.map(([year, month, day]) =>
      FoldkitCalendar.make(year, month, Math.min(day, FoldkitCalendar.daysInMonth(year, month))),
    ),
  );

const maybeCompleteTime = (model: Model, segments: Segments): Option.Option<TimeOfDay> =>
  pipe(
    Option.all([segments.hour, segments.minute]),
    Option.filter(() => !isTwelveHour(model.locale) || Option.isSome(segments.isPm)),
    Option.map(([hour, minute]) => ({ hour, minute })),
  );

const isEmpty = (model: Model, segments: Segments): boolean =>
  Array.every(segmentOrder(model.kind, model.locale), (segment) =>
    Option.isNone(segmentValue(modifyFields(model, { segments: () => segments }), segment)),
  );

const changeOutMessage = (model: Model, segments: Segments): Option.Option<OutMessage> => {
  if (isEmpty(model, segments)) {
    return Option.some(
      model.kind === 'Date'
        ? OutMessage.ChangedDate({ maybeDate: Option.none() })
        : OutMessage.ChangedTime({ maybeTime: Option.none() }),
    );
  } else if (model.kind === 'Date') {
    return Option.map(maybeCompleteDate(segments), (date) => OutMessage.ChangedDate({ maybeDate: Option.some(date) }));
  } else {
    return Option.map(maybeCompleteTime(model, segments), (time) =>
      OutMessage.ChangedTime({ maybeTime: Option.some(time) }),
    );
  }
};

export const segmentId = (id: string, segment: SegmentType): string => `${id}-segment-${segment}`;

const FocusSegment = Command.define('FocusSegment', {
  args: { id: Schema.String, segment: SegmentType },
  messages: [Message.CompletedFocusSegment],
  execute: ({ id, segment }) =>
    Dom.focus(`#${segmentId(id, segment)}`).pipe(Effect.ignore, Effect.as(Message.CompletedFocusSegment())),
});

const CheckFocusInField = Command.define('CheckFocusInField', {
  args: { id: Schema.String },
  messages: [Message.CompletedCheckFocusInField],
  execute: ({ id }) =>
    Effect.sleep(Duration.zero).pipe(
      Effect.map(() =>
        Message.CompletedCheckFocusInField({
          isInField: Option.isSome(
            Option.flatMapNullishOr(Option.fromNullishOr(document.activeElement), (element) =>
              element.closest(`#${id}`),
            ),
          ),
        }),
      ),
    ),
});

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const neighbour = (model: Model, segment: SegmentType, step: 1 | -1): Option.Option<SegmentType> => {
  const order = segmentOrder(model.kind, model.locale);
  return pipe(
    Array.findFirstIndex(order, (candidate) => candidate === segment),
    Option.flatMap((index) => Array.get(order, index + step)),
  );
};

type Move = 'Stay' | 'Next' | 'Previous';

const moveStep = (move: Move): Option.Option<1 | -1> =>
  Match.value(move).pipe(
    Match.withReturnType<Option.Option<1 | -1>>(),
    Match.when('Stay', () => Option.none()),
    Match.when('Next', () => Option.some(1)),
    Match.when('Previous', () => Option.some(-1)),
    Match.exhaustive,
  );

const moved = (model: Model, segment: SegmentType, move: Move): UpdateReturn =>
  Option.match(
    Option.flatMap(moveStep(move), (step) => neighbour(model, segment, step)),
    {
      onNone: () => ({ model: modifyFields(model, { typedDigits: () => '' }) }),
      onSome: (next) => ({
        model: modifyFields(model, { typedDigits: () => '', maybeFocusedSegment: () => Option.some(next) }),
        commands: [FocusSegment({ id: model.id, segment: next })],
      }),
    },
  );

const applySegments = (
  model: Model,
  segment: SegmentType,
  segments: Segments,
  typedDigits: string,
  move: Move,
): UpdateReturn => {
  const maybeOutMessage = changeOutMessage(model, segments);
  const nextModel = modifyFields(model, {
    segments: () => segments,
    typedDigits: () => typedDigits,
    committedSegments: (committed) => (Option.isSome(maybeOutMessage) ? segments : committed),
  });
  const movedReturn = move === 'Stay' ? { model: nextModel } : moved(nextModel, segment, move);
  return {
    ...movedReturn,
    ...Option.match(maybeOutMessage, { onNone: () => ({}), onSome: (outMessage) => ({ outMessage }) }),
  };
};

const DIGIT = /^\d$/;
const BASE = 10;

const typedDigit = (model: Model, segment: SegmentType, digit: string): UpdateReturn => {
  const bounds = boundsOf(model, segment);
  const candidate = `${model.typedDigits}${digit}`;
  const candidateValue = globalThis.Number(candidate);
  const typed = candidateValue > bounds.max ? digit : candidate;
  const typedValue = globalThis.Number(typed);
  const isDone = typed.length >= bounds.digits || typedValue * BASE > bounds.max;
  const maybeValue = typedValue >= bounds.min ? Option.some(typedValue) : Option.none();
  return applySegments(
    model,
    segment,
    withSegmentValue(model, segment, maybeValue),
    isDone ? '' : typed,
    isDone ? 'Next' : 'Stay',
  );
};

const pressedSegmentKey = (model: Model, pressedSegment: SegmentType, key: string): UpdateReturn => {
  const segment = Option.getOrElse(model.maybeFocusedSegment, () => pressedSegment);
  const bounds = boundsOf(model, segment);
  return Match.value(key).pipe(
    Match.withReturnType<UpdateReturn>(),
    Match.when('ArrowUp', () =>
      applySegments(
        model,
        segment,
        withSegmentValue(model, segment, Option.some(steppedValue(bounds, segmentValue(model, segment), 1))),
        '',
        'Stay',
      ),
    ),
    Match.when('ArrowDown', () =>
      applySegments(
        model,
        segment,
        withSegmentValue(model, segment, Option.some(steppedValue(bounds, segmentValue(model, segment), -1))),
        '',
        'Stay',
      ),
    ),
    Match.when('ArrowRight', () => moved(model, segment, 'Next')),
    Match.when('ArrowLeft', () => moved(model, segment, 'Previous')),
    Match.whenOr('Backspace', 'Delete', () => {
      if (String.isNonEmpty(model.typedDigits)) {
        const typed = model.typedDigits.slice(0, -1);
        const maybeValue = pipe(
          Option.liftPredicate(typed, String.isNonEmpty),
          Option.map((digits) => globalThis.Number(digits)),
          Option.filter((value) => value >= bounds.min),
        );
        return applySegments(model, segment, withSegmentValue(model, segment, maybeValue), typed, 'Stay');
      } else if (Option.isSome(segmentValue(model, segment))) {
        return applySegments(model, segment, withSegmentValue(model, segment, Option.none()), '', 'Stay');
      } else {
        return moved(model, segment, 'Previous');
      }
    }),
    Match.when(
      (pressed) =>
        segment === 'dayPeriod' && (pressed === 'a' || pressed === 'A' || pressed === 'p' || pressed === 'P'),
      (pressed) =>
        applySegments(
          model,
          segment,
          withSegmentValue(model, segment, Option.some(pressed.toLowerCase() === 'p' ? 1 : 0)),
          '',
          'Next',
        ),
    ),
    Match.when(
      (pressed) => segment !== 'dayPeriod' && DIGIT.test(pressed),
      (digit) => typedDigit(model, segment, digit),
    ),
    Match.orElse(() => ({ model })),
  );
};

const toGotPickerMessage = (message: DatePicker.Message): Message => Message.GotPickerMessage({ message });

const pickerFold = {
  read: (model: Model) => Option.some(model.picker),
  write: (model: Model, nextPicker: DatePicker.Model) => modifyFields(model, { picker: () => nextPicker }),
  toParentMessage: toGotPickerMessage,
};

const foldPicker = Update.foldChild({
  update: DatePicker.update,
  ...pickerFold,
  foldOutMessage: DatePicker.OutMessage.match<Update.StepWithOutMessage<Model, Message, OutMessage>>({
    ChangedViewMonth: () => (stepModel) => ({ model: stepModel }),
    SelectedDate:
      ({ date }) =>
      (stepModel) =>
        applySegments(stepModel, 'day', dateSegments(Option.some(date)), '', 'Stay'),
    ClearedDate: () => (stepModel) => applySegments(stepModel, 'day', EMPTY_SEGMENTS, '', 'Stay'),
  }),
});

const foldPickerOpen = Update.foldChildStep({
  update: DatePicker.open,
  ...pickerFold,
  foldOutMessage: DatePicker.OutMessage.match<Update.Step<Model, Message>>({
    ChangedViewMonth: () => (stepModel) => ({ model: stepModel }),
    SelectedDate: () => (stepModel) => ({ model: stepModel }),
    ClearedDate: () => (stepModel) => ({ model: stepModel }),
  }),
});

const syncPickerView = (model: Model): Model =>
  Option.match(maybeCompleteDate(model.committedSegments), {
    onNone: () => model,
    onSome: (date) => modifyFields(model, { picker: DatePicker.focusDate(date) }),
  });

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    PressedSegmentKey: ({ segment, key }) => pressedSegmentKey(model, segment, key),
    FocusedSegment: ({ segment }) => ({
      model: Option.contains(model.maybeFocusedSegment, segment)
        ? model
        : modifyFields(model, { maybeFocusedSegment: () => Option.some(segment), typedDigits: () => '' }),
    }),
    BlurredSegment: () => ({ model, commands: [CheckFocusInField({ id: model.id })] }),
    CompletedCheckFocusInField: ({ isInField }) => ({
      model: isInField
        ? model
        : modifyFields(model, {
            segments: () => model.committedSegments,
            typedDigits: () => '',
            maybeFocusedSegment: () => Option.none(),
          }),
    }),
    CompletedFocusSegment: () => ({ model }),
    PressedOpenPicker: () => foldPickerOpen(syncPickerView(model)),
    GotPickerMessage: ({ message: pickerMessage }) => foldPicker(model, pickerMessage),
  });

export const reflectDate = (model: Model, maybeDate: Option.Option<CalendarDate>): Model =>
  modifyFields(model, { segments: () => dateSegments(maybeDate), committedSegments: () => dateSegments(maybeDate) });

const PLACEHOLDERS: Readonly<Record<string, Readonly<Record<SegmentType, string>>>> = {
  de: { year: 'JJJJ', month: 'MM', day: 'TT', hour: '––', minute: '––', dayPeriod: 'AM' },
};

const DEFAULT_PLACEHOLDERS: Readonly<Record<SegmentType, string>> = {
  year: 'yyyy',
  month: 'mm',
  day: 'dd',
  hour: '––',
  minute: '––',
  dayPeriod: 'AM',
};

const placeholderOf = (locale: string, segment: SegmentType): string =>
  pipe(
    Option.fromNullishOr(PLACEHOLDERS[new Intl.Locale(locale).language]),
    Option.getOrElse(() => DEFAULT_PLACEHOLDERS),
  )[segment];

const SEGMENT_LABELS: Readonly<Record<SegmentType, string>> = {
  year: 'year',
  month: 'month',
  day: 'day',
  hour: 'hour',
  minute: 'minute',
  dayPeriod: 'AM/PM',
};

const dayPeriodText = (locale: string, isPm: boolean): string =>
  pipe(
    new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true, timeZone: 'UTC' }).formatToParts(
      Date.UTC(2025, 0, 1, isPm ? 13 : 1),
    ),
    Array.findFirst((part) => part.type === 'dayPeriod'),
    Option.match({ onNone: () => (isPm ? 'PM' : 'AM'), onSome: ({ value }) => value }),
  );

const segmentText = (model: Model, segment: SegmentType): Option.Option<string> =>
  Option.map(segmentValue(model, segment), (value) =>
    Match.value(segment).pipe(
      Match.withReturnType<string>(),
      Match.when('dayPeriod', () => dayPeriodText(model.locale, value === 1)),
      Match.when('year', () => String.padStart(4, '0')(globalThis.String(value))),
      Match.orElse(() => String.padStart(2, '0')(globalThis.String(value))),
    ),
  );

const fieldSurfaceClassName = cn(
  Input.inputSurfaceVariants({ scope: 'within' }),
  'flex h-control w-full min-w-0 cursor-text items-center pr-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] pl-[calc(var(--spacing-field-pad)-1px)] text-control',
  'data-disabled:cursor-not-allowed data-disabled:opacity-64 data-disabled:shadow-field-flat data-disabled:before:shadow-none',
);

const segmentClassName = cn(
  'inline rounded-control-xs px-px text-foreground caret-transparent outline-hidden',
  'data-placeholder:text-faint-foreground',
  'focus:bg-primary-solid focus:text-primary-solid-foreground focus:data-placeholder:text-primary-solid-foreground',
  'data-invalid:text-destructive data-invalid:data-placeholder:text-destructive',
  'data-invalid:focus:bg-destructive-solid data-invalid:focus:text-destructive-solid-foreground data-invalid:focus:data-placeholder:text-destructive-solid-foreground',
  'data-disabled:cursor-not-allowed data-disabled:text-disabled-foreground',
);

const literalClassName = 'px-0 text-muted-foreground in-data-disabled:text-disabled-foreground';

const triggerClassName = buttonVariants({
  emphasis: 'ghost',
  className: InputGroup.buttonVariants({ size: 'icon-xs' }),
});

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  ariaLabel?: string | undefined;
  ariaLabelledBy?: string | undefined;
  placeholder?: string | undefined;
  isInvalid?: boolean | undefined;
  isDisabled?: boolean | undefined;
  chooseDateLabel?: string | undefined;
  className?: string | undefined;
}>;

const segmentsView = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, isInvalid = false, isDisabled = false, placeholder } = config;
  const showsPlaceholder = placeholder !== undefined && isEmpty(model, model.segments);

  const segmentView = (segment: SegmentType): Html => {
    const bounds = boundsOf(model, segment);
    const maybeValue = segmentValue(model, segment);
    const maybeText = segmentText(model, segment);
    const handleKeyDown = (key: string, { altKey }: Readonly<{ altKey: boolean }>): Option.Option<ParentMessage> => {
      if (altKey && key === 'ArrowDown' && model.kind === 'Date') {
        return Option.some(toParentMessage(Message.PressedOpenPicker()));
      } else if (
        key === 'Tab' ||
        (key.length > 1 &&
          !Array.contains(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'], key))
      ) {
        return Option.none();
      } else {
        return Option.some(toParentMessage(Message.PressedSegmentKey({ segment, key })));
      }
    };
    return h.span(
      [
        h.Id(segmentId(model.id, segment)),
        h.Role('spinbutton'),
        h.AriaLabel(SEGMENT_LABELS[segment]),
        h.Attribute('aria-valuemin', globalThis.String(bounds.min)),
        h.Attribute('aria-valuemax', globalThis.String(bounds.max)),
        ...Option.match(maybeValue, {
          onNone: () => [],
          onSome: (value) => [h.Attribute('aria-valuenow', globalThis.String(value))],
        }),
        ...Option.match(maybeText, {
          onNone: () => [h.Attribute('aria-valuetext', 'Empty'), h.DataAttribute('placeholder', '')],
          onSome: (text) => [h.Attribute('aria-valuetext', text)],
        }),
        h.Attribute('inputmode', segment === 'dayPeriod' ? 'text' : 'numeric'),
        h.DataAttribute('type', segment),
        ...(isInvalid ? [h.DataAttribute('invalid', ''), h.AriaInvalid(true)] : []),
        ...(isDisabled
          ? [h.DataAttribute('disabled', ''), h.AriaDisabled(true)]
          : [
              h.Tabindex(0),
              h.OnKeyDownPreventDefault(handleKeyDown),
              h.OnFocus(toParentMessage(Message.FocusedSegment({ segment }))),
              h.OnBlur(toParentMessage(Message.BlurredSegment())),
            ]),
        h.Class(segmentClassName),
      ],
      [Option.getOrElse(maybeText, () => placeholderOf(model.locale, segment))],
    );
  };

  return h.span(
    [h.Class('relative flex min-w-0 flex-1 items-center')],
    [
      h.div(
        [
          h.DataAttribute('slot', 'date-segments'),
          h.Class(
            cn(
              'peer flex min-w-0 flex-1 items-center max-md:text-[1rem]',
              showsPlaceholder && 'opacity-0 focus-within:opacity-100',
            ),
          ),
        ],
        Array.map(layout(model.kind, model.locale), (part) =>
          part._tag === 'Segment'
            ? segmentView(part.segment)
            : h.span([h.AriaHidden(true), h.DataAttribute('type', 'literal'), h.Class(literalClassName)], [part.text]),
        ),
      ),
      ...(showsPlaceholder
        ? [
            h.span(
              [
                h.Class(
                  'pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-faint-foreground peer-focus-within:hidden max-md:text-[1rem]',
                ),
              ],
              [placeholder ?? ''],
            ),
          ]
        : []),
    ],
  );
};

const groupAttributes = <ParentMessage>(
  config: ViewConfig<ParentMessage>,
  slot: string,
  h: HtmlBuilder<ParentMessage>,
) => {
  const { model, ariaLabel, ariaLabelledBy, isInvalid = false, isDisabled = false, className } = config;
  return [
    h.Id(model.id),
    h.Role('group'),
    h.DataAttribute('slot', slot),
    ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
    ...(ariaLabelledBy === undefined ? [] : [h.AriaLabelledBy(ariaLabelledBy)]),
    ...(isInvalid ? [h.AriaInvalid(true), h.DataAttribute('invalid', '')] : []),
    ...(isDisabled ? [h.DataAttribute('disabled', ''), h.AriaDisabled(true)] : []),
    h.Class(cn(fieldSurfaceClassName, className)),
  ];
};

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, isDisabled = false, chooseDateLabel = DEFAULT_CHOOSE_DATE_LABEL } = config;
  const toPickerParentMessage = (message: DatePicker.Message): ParentMessage =>
    toParentMessage(toGotPickerMessage(message));

  const picker = h.submodel({
    slotId: model.picker.id,
    model: model.picker,
    view: DatePicker.view,
    viewInputs: {
      anchor: { placement: 'bottom-end', gap: 8, padding: 8 },
      maybeSelectedDate: maybeCompleteDate(model.committedSegments),
      triggerContent: () => icon('calendar'),
      toCalendarView: Calendar.toView({}, h),
      isDisabled,
      ariaLabel: chooseDateLabel,
      className: 'flex shrink-0',
      triggerClassName,
      triggerAttributes: childAttributes([h.DataAttribute('slot', 'input-group-button')]),
      panelClassName: cn(Popover.popupClassName, 'w-auto gap-0 p-0'),
    },
    toParentMessage: toPickerParentMessage,
  });

  return h.div(groupAttributes(config, 'date-field', h), [segmentsView(config, h), picker]);
};

export const time = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html =>
  h.div(groupAttributes(config, 'time-field', h), [
    segmentsView(config, h),
    h.span(
      [
        h.AriaHidden(true),
        h.Class(
          'flex size-control-xs shrink-0 items-center justify-center text-muted-foreground in-data-disabled:text-disabled-foreground [&_svg]:size-icon',
        ),
      ],
      [icon('clock')],
    ),
  ]);

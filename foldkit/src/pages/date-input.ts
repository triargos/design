import { Option, Record, Schema } from 'effect';
import { Calendar, Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page, row } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as DateInput from '../pavo/date-input.ts';
import * as Field from '../pavo/field.ts';

export const title = 'Date Input';
export const description = 'A date or a time, typed into segments; a date can be picked in a calendar.';

const FieldKey = Schema.Literals([
  'default',
  'placeholderStart',
  'placeholderEnd',
  'timeStart',
  'timeEnd',
  'formDate',
  'formTime',
  'localeGb',
  'localeDe',
  'stateDateInvalid',
  'stateDateDisabled',
  'stateTimeInvalid',
  'stateTimeDisabled',
]);
type FieldKey = typeof FieldKey.Type;

export const Model = Schema.Struct({
  fields: Schema.Record(FieldKey, DateInput.Model),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotFieldMessage: { fieldId: FieldKey, message: DateInput.Message },
});
export type Message = typeof Message.Type;

const MARCH_14 = Option.some(Calendar.make(2025, 3, 14));
const NINE_THIRTY = Option.some({ hour: 9, minute: 30 });

export const init = (context: PageContext): Update.Return<Model, Message> => {
  const date = (key: FieldKey, maybeDate: Option.Option<Calendar.CalendarDate>, locale?: string): DateInput.Model =>
    DateInput.init({ id: `date-input-${key}`, today: context.today, maybeDate, locale });
  const time = (key: FieldKey, maybeTime: Option.Option<DateInput.TimeOfDay>, locale?: string): DateInput.Model =>
    DateInput.initTime({ id: `date-input-${key}`, today: context.today, maybeTime, locale });
  return {
    model: {
      fields: {
        default: date('default', MARCH_14),
        placeholderStart: date('placeholderStart', Option.none()),
        placeholderEnd: date('placeholderEnd', Option.none()),
        timeStart: time('timeStart', NINE_THIRTY),
        timeEnd: time('timeEnd', Option.none(), 'de-DE'),
        formDate: date('formDate', MARCH_14),
        formTime: time('formTime', NINE_THIRTY),
        localeGb: date('localeGb', MARCH_14, 'en-GB'),
        localeDe: date('localeDe', MARCH_14, 'de-DE'),
        stateDateInvalid: date('stateDateInvalid', MARCH_14),
        stateDateDisabled: date('stateDateDisabled', MARCH_14),
        stateTimeInvalid: time('stateTimeInvalid', NINE_THIRTY),
        stateTimeDisabled: time('stateTimeDisabled', NINE_THIRTY),
      },
    },
  };
};

const writeField = (model: Model, key: FieldKey, nextField: DateInput.Model): Model =>
  modifyFields(model, { fields: Record.set(key, nextField) });

const LOCALE_SIBLING: Partial<Record<FieldKey, FieldKey>> = { localeGb: 'localeDe', localeDe: 'localeGb' };

const foldField = Update.foldChildAt({
  update: DateInput.update,
  readAt: (model: Model, key: FieldKey) => Option.some(model.fields[key]),
  writeAt: writeField,
  toParentMessage: (key: FieldKey, message: DateInput.Message) => Message.GotFieldMessage({ fieldId: key, message }),
  foldOutMessage: (key: FieldKey) =>
    DateInput.OutMessage.match<Update.Step<Model, Message>>({
      UpdatedDate:
        ({ maybeDate }) =>
        (stepModel) =>
          Option.match(Option.fromNullishOr(LOCALE_SIBLING[key]), {
            onNone: () => ({ model: stepModel }),
            onSome: (siblingKey) => ({
              model: writeField(stepModel, siblingKey, DateInput.reflectDate(stepModel.fields[siblingKey], maybeDate)),
            }),
          }),
      UpdatedTime: () => (stepModel) => ({ model: stepModel }),
    }),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotFieldMessage: ({ fieldId: key, message }) => foldField(model, key, message),
  });

type FieldOverrides = Omit<DateInput.ViewConfig<Message>, 'model' | 'toParentMessage'>;

const dateField = (model: Model, key: FieldKey, overrides: FieldOverrides, h: HtmlBuilder<Message>): Html =>
  DateInput.view(
    {
      model: model.fields[key],
      toParentMessage: (message) => Message.GotFieldMessage({ fieldId: key, message }),
      ...overrides,
    },
    h,
  );

const timeField = (model: Model, key: FieldKey, overrides: FieldOverrides, h: HtmlBuilder<Message>): Html =>
  DateInput.time(
    {
      model: model.fields[key],
      toParentMessage: (message) => Message.GotFieldMessage({ fieldId: key, message }),
      ...overrides,
    },
    h,
  );

const inAForm = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.group(
    {
      columns: 2,
      className: 'w-full max-w-md',
      children: [
        Field.view(
          {
            children: [
              Field.label({ attributes: [h.Id('meeting-date-label')], children: ['Date'] }, h),
              dateField(model, 'formDate', { ariaLabelledBy: 'meeting-date-label' }, h),
            ],
          },
          h,
        ),
        Field.view(
          {
            children: [
              Field.label({ attributes: [h.Id('meeting-time-label')], children: ['Start'] }, h),
              timeField(model, 'formTime', { ariaLabelledBy: 'meeting-time-label' }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const states = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('grid w-fit grid-cols-2 gap-2')],
    [
      dateField(model, 'stateDateInvalid', { isInvalid: true, ariaLabel: 'Date, invalid', className: 'w-48' }, h),
      dateField(model, 'stateDateDisabled', { isDisabled: true, ariaLabel: 'Date, disabled', className: 'w-48' }, h),
      timeField(model, 'stateTimeInvalid', { isInvalid: true, ariaLabel: 'Time, invalid', className: 'w-48' }, h),
      timeField(model, 'stateTimeDisabled', { isDisabled: true, ariaLabel: 'Time, disabled', className: 'w-48' }, h),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A date typed into segments at input height; the icon at the end opens the calendar. The value is a Calendar.CalendarDate, no time zone. DateInput.time takes a time of day as hour and minute.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            children: [dateField(model, 'default', { ariaLabel: 'Due date', className: 'w-48' }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Placeholder',
            description: 'Empty segments, or a word for the empty value.',
            children: [
              row(
                [
                  dateField(model, 'placeholderStart', { ariaLabel: 'Start date', className: 'w-48' }, h),
                  dateField(
                    model,
                    'placeholderEnd',
                    { ariaLabel: 'End date', placeholder: 'No end date', className: 'w-48' },
                    h,
                  ),
                ],
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Time',
            description: [
              code('DateInput.time', h),
              ': ',
              code('{ hour, minute }', h),
              ', 24-hour; the segments follow the locale’s clock.',
            ],
            children: [
              row(
                [
                  timeField(model, 'timeStart', { ariaLabel: 'Start time', className: 'w-48' }, h),
                  timeField(model, 'timeEnd', { ariaLabel: 'End time', className: 'w-48' }, h),
                ],
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          { title: 'In a form', description: 'A date and a time, two columns.', children: [inAForm(model, h)] },
          h,
        ),
        exampleSection(
          {
            title: 'Locale',
            description: [code('locale', h), ' sets the segment order and the calendar; the default is en-US.'],
            children: [
              row(
                [
                  dateField(model, 'localeGb', { ariaLabel: 'Due date, en-GB', className: 'w-48' }, h),
                  dateField(model, 'localeDe', { ariaLabel: 'Due date, de-DE', className: 'w-48' }, h),
                ],
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          { title: 'States', description: 'Invalid, disabled; a date, then a time.', children: [states(model, h)] },
          h,
        ),
      ],
    },
    h,
  ),
);

import { Option, Schema } from 'effect';
import { Calendar as FoldkitCalendar, Submodel, Update } from 'foldkit';
import type { Html } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Calendar from '../pavo/calendar.ts';

export const title = 'Calendar';
export const description = 'A month to pick a day or a range in.';

export const Model = Schema.Struct({
  defaultCalendar: Calendar.Model,
  maybeDefaultDate: Schema.Option(FoldkitCalendar.CalendarDate),
  rangeCalendar: Calendar.Model,
  rangeSelection: Calendar.RangeSelection,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotDefaultCalendarMessage: { message: Calendar.Message },
  GotRangeCalendarMessage: { message: Calendar.Message },
});
export type Message = typeof Message.Type;

const DEFAULT_DATE = FoldkitCalendar.make(2025, 3, 14);
const RANGE_START = FoldkitCalendar.make(2025, 3, 10);
const RANGE_END = FoldkitCalendar.make(2025, 3, 14);

export const init = (context: PageContext): Update.Return<Model, Message> => ({
  model: {
    defaultCalendar: Calendar.init({ id: 'calendar-default', today: context.today, initialViewDate: DEFAULT_DATE }),
    maybeDefaultDate: Option.some(DEFAULT_DATE),
    rangeCalendar: Calendar.init({ id: 'calendar-range', today: context.today, initialViewDate: RANGE_START }),
    rangeSelection: Calendar.initRangeSelection(Option.some({ start: RANGE_START, end: RANGE_END })),
  },
});

const toDefaultCalendarMessage = (message: Calendar.Message): Message => Message.GotDefaultCalendarMessage({ message });
const toRangeCalendarMessage = (message: Calendar.Message): Message => Message.GotRangeCalendarMessage({ message });

const foldDefaultCalendarOutMessage = Calendar.OutMessage.match<Update.Step<Model, Message>>({
  ChangedViewMonth: () => (stepModel) => ({ model: stepModel }),
  SelectedDate:
    ({ date }) =>
    (stepModel) => ({ model: modifyFields(stepModel, { maybeDefaultDate: () => Option.some(date) }) }),
});

const foldRangeCalendarOutMessage = Calendar.OutMessage.match<Update.Step<Model, Message>>({
  ChangedViewMonth: () => (stepModel) => ({ model: stepModel }),
  SelectedDate:
    ({ date }) =>
    (stepModel) => ({
      model: modifyFields(stepModel, { rangeSelection: (selection) => Calendar.selectRangeDate(selection, date) }),
    }),
});

const foldDefaultCalendar = Update.foldChild({
  update: Calendar.update,
  read: (model: Model) => Option.some(model.defaultCalendar),
  write: (model: Model, nextDefaultCalendar: Calendar.Model) =>
    modifyFields(model, { defaultCalendar: () => nextDefaultCalendar }),
  toParentMessage: toDefaultCalendarMessage,
  foldOutMessage: foldDefaultCalendarOutMessage,
});

const foldRangeCalendar = Update.foldChild({
  update: Calendar.update,
  read: (model: Model) => Option.some(model.rangeCalendar),
  write: (model: Model, nextRangeCalendar: Calendar.Model) =>
    modifyFields(model, { rangeCalendar: () => nextRangeCalendar }),
  toParentMessage: toRangeCalendarMessage,
  foldOutMessage: foldRangeCalendarOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotDefaultCalendarMessage: ({ message }) => foldDefaultCalendar(model, message),
    GotRangeCalendarMessage: ({ message }) => foldRangeCalendar(model, message),
  });

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A month to pick a day or a range in. Date Input opens it; use it alone where the calendar is the content.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: ['A day as ', code('Calendar.CalendarDate', h), '.'],
            children: [
              Calendar.view(
                {
                  model: model.defaultCalendar,
                  toParentMessage: toDefaultCalendarMessage,
                  maybeSelectedDate: model.maybeDefaultDate,
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Range',
            description: [code("mode: 'range'", h), ': the first click sets the start, the second the end.'],
            children: [
              Calendar.view(
                {
                  mode: 'range',
                  model: model.rangeCalendar,
                  toParentMessage: toRangeCalendarMessage,
                  rangeSelection: model.rangeSelection,
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
);

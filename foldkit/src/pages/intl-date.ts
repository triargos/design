import { Clock, DateTime, Duration, Effect, Option, Schema } from 'effect';
import { Calendar, Command, Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import { icon } from '../pavo/icon.ts';
import * as IntlDate from '../pavo/intl-date.ts';

export const title = 'Intl Date';
export const description = 'A date formatted for reading.';

const RELATIVE_OFFSET = Duration.hours(2);

export const Model = Schema.Struct({
  maybeNowMillis: Schema.Option(Schema.Number),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  CompletedReadClock: { nowMillis: Schema.Number },
});
export type Message = typeof Message.Type;

const ReadClock = Command.define('ReadClock', {
  messages: [Message.CompletedReadClock],
  execute: Clock.currentTimeMillis.pipe(Effect.map((nowMillis) => Message.CompletedReadClock({ nowMillis }))),
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { maybeNowMillis: Option.none() },
  commands: [ReadClock()],
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    CompletedReadClock: ({ nowMillis }) => ({
      model: modifyFields(model, { maybeNowMillis: () => Option.some(nowMillis) }),
    }),
  });

const SENT_AT = DateTime.makeUnsafe('2025-03-14T09:30:00Z');

const column = (children: ReadonlyArray<Html>, h: HtmlBuilder<Message>): Html =>
  h.div([h.Class('flex flex-col gap-1 text-body')], children);

const defaultExample = (h: HtmlBuilder<Message>): Html =>
  column(
    [
      IntlDate.moment({ date: SENT_AT }, h),
      IntlDate.moment({ date: SENT_AT, format: { dateStyle: 'long', timeStyle: 'short' } }, h),
      IntlDate.moment({ date: SENT_AT, format: { day: 'numeric', month: 'short' } }, h),
    ],
    h,
  );

const relativeExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.span(
    [h.Class('text-body')],
    Option.match(model.maybeNowMillis, {
      onNone: () => [],
      onSome: (nowMillis) => {
        const now = DateTime.makeUnsafe(nowMillis);
        return [IntlDate.relative({ date: DateTime.subtractDuration(now, RELATIVE_OFFSET), now }, h)];
      },
    }),
  );

const rangeExample = (h: HtmlBuilder<Message>): Html =>
  h.span(
    [h.Class('flex items-center gap-2 text-body')],
    [
      icon('calendar-time', { className: 'size-4 text-muted-foreground' }),
      IntlDate.day({ date: Calendar.make(2025, 3, 10), end: Calendar.make(2025, 3, 14) }, h),
    ],
  );

const localeExample = (h: HtmlBuilder<Message>): Html =>
  column(
    [
      IntlDate.moment({ date: SENT_AT, locale: 'en-GB', timeZone: 'Europe/London' }, h),
      IntlDate.moment({ date: SENT_AT, locale: 'de-DE', timeZone: 'Europe/Berlin' }, h),
      IntlDate.moment({ date: SENT_AT, locale: 'ja-JP', timeZone: 'Asia/Tokyo' }, h),
    ],
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A date formatted for reading, from a Calendar.CalendarDate (a day) or a DateTime.Utc (a moment). Format dates with these, never by hand.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [
              code('IntlDate.moment', h),
              ': a moment in the viewer’s time zone, then two ',
              code('format', h),
              's.',
            ],
            children: [defaultExample(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Day',
            description: [code('IntlDate.day', h), ': a CalendarDate has no zone, the same day for every viewer.'],
            children: [h.span([h.Class('text-body')], [IntlDate.day({ date: Calendar.make(2025, 3, 14) }, h)])],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Relative',
            description: [
              code('IntlDate.relative', h),
              ': the exact moment in a tooltip. ',
              code('now', h),
              ' comes from the Model, read by a Command.',
            ],
            children: [relativeExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Range',
            description: [code('end', h), ': a range, shared parts said once.'],
            children: [rangeExample(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Locale',
            description: [
              code('locale', h),
              ' and ',
              code('timeZone', h),
              '; the default is en-US in the runtime’s zone.',
            ],
            children: [localeExample(h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

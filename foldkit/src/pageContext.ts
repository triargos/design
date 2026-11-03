import { Schema } from 'effect';
import { Calendar } from 'foldkit';

export const PageContext = Schema.Struct({
  today: Calendar.CalendarDate,
});

export type PageContext = typeof PageContext.Type;

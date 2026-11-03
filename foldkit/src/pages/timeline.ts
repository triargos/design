import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Timeline from '../pavo/timeline.ts';

export const title = 'Timeline';
export const description = 'Events in order, with what happened when.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const ENTRIES = [
  { date: 'March 3', title: 'Project created', body: 'Jordan Lee started Website redesign.' },
  { date: 'March 5', title: 'Brief approved', body: 'Scope and budget signed off by the team.' },
  { date: 'March 12', title: 'Design review', body: 'Homepage and pricing pages reviewed.' },
  { date: 'Upcoming', title: 'Launch', body: 'Planned for June 30.' },
] as const;

const timeline = (orientation: Timeline.Orientation, className: string, h: HtmlBuilder<Message>): Html =>
  Timeline.view(
    {
      value: 3,
      orientation,
      className,
      items: ENTRIES.map((entry) => ({
        children: [
          Timeline.date({ children: [entry.date] }, h),
          Timeline.title({ children: [entry.title] }, h),
          Timeline.content({ children: [entry.body] }, h),
        ],
      })),
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description,
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('value: 3', h), ': three steps reached.'],
            children: [timeline('vertical', 'max-w-md', h)],
          },
          h,
        ),
        exampleSection({ title: 'Horizontal', children: [timeline('horizontal', 'w-full max-w-3xl', h)] }, h),
      ],
    },
    h,
  ),
);

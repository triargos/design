import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Card from '../pavo/card.ts';
import * as Stat from '../pavo/stat.ts';
import * as StatusDot from '../pavo/status-dot.ts';

export const title = 'Stat';
export const description = 'A big number and what it counts.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const SEGMENTS = [
  { label: 'On track', value: 14, intent: 'success', bar: 'bg-success' },
  { label: 'At risk', value: 5, intent: 'warning', bar: 'bg-warning' },
  { label: 'Not started', value: 3, intent: 'neutral', bar: 'bg-faint-foreground' },
] as const;

const SEGMENT_TOTAL = SEGMENTS.reduce((sum, segment) => sum + segment.value, 0);

const INVOICE_STATS = [
  { label: 'Paid', value: '$12,480' },
  { label: 'Outstanding', value: '$3,150' },
  { label: 'Overdue', value: '$640' },
] as const;

const withStatusDot = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-md flex-col gap-group')],
    [
      h.div(
        [h.Class('grid grid-cols-3 gap-group')],
        SEGMENTS.map((segment) =>
          Stat.view(
            {
              children: [
                Stat.label(
                  {
                    children: [
                      StatusDot.view({ intent: segment.intent }, h),
                      h.span([h.Class('truncate')], [segment.label]),
                    ],
                  },
                  h,
                ),
                Stat.value({ children: [String(segment.value)] }, h),
              ],
            },
            h,
          ),
        ),
      ),
      h.div(
        [h.AriaHidden(true), h.Class('flex h-1.5 gap-0.5')],
        SEGMENTS.map((segment) =>
          h.div([
            h.Class(`rounded-full ${segment.bar}`),
            h.Style({ 'flex-grow': String(segment.value / SEGMENT_TOTAL) }),
          ]),
        ),
      ),
    ],
  );

const inCard = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header({ children: [Card.title({ children: ['Invoices this quarter'] }, h)] }, h),
        Card.content(
          {
            className: 'grid grid-cols-3 gap-group p-card',
            children: INVOICE_STATS.map((stat) =>
              Stat.view(
                { children: [Stat.value({ children: [stat.value] }, h), Stat.label({ children: [stat.label] }, h)] },
                h,
              ),
            ),
          },
          h,
        ),
      ],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'A big number and what it counts: the value in the title role with tabular figures, the label in caption. Children in reading order, the label above or below.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('Stat.view', h), ' › ', code('Stat.label', h), ' + ', code('Stat.value', h)],
            children: [
              Stat.view(
                { children: [Stat.label({ children: ['Open tasks'] }, h), Stat.value({ children: ['128'] }, h)] },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With status dot',
            description: 'The dot ties the number to a series.',
            children: [withStatusDot(h)],
          },
          h,
        ),
        exampleSection({ title: 'In card', isBare: true, children: [inCard(h)] }, h),
      ],
    },
    h,
  ),
);

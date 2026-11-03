import { Array, Option, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Card from '../pavo/card.ts';
import * as Chart from '../pavo/chart.ts';

export const title = 'Chart';
export const description = 'A small SVG chart in our type and tooltip surface.';

const SERIES: ReadonlyArray<Chart.Series> = [
  { key: 'engineering', label: 'Engineering', color: 'var(--chart-1)' },
  { key: 'design', label: 'Design', color: 'var(--chart-2)' },
  { key: 'marketing', label: 'Marketing', color: 'var(--chart-3)' },
  { key: 'sales', label: 'Sales', color: 'var(--chart-4)' },
  { key: 'support', label: 'Support', color: 'var(--chart-5)' },
];

const LINE_SERIES: ReadonlyArray<Chart.Series> = Array.take(SERIES, 2);

const DATA: ReadonlyArray<Chart.Datum> = Array.map(['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], (month, index) => ({
  label: month,
  values: {
    engineering: 120 + index * 18,
    design: 40 + index * 4,
    marketing: 12 + (index % 3) * 3,
    sales: 6 + (index % 2),
    support: 3 + index,
  },
}));

export const Model = Schema.Struct({
  barChart: Chart.Model,
  lineChart: Chart.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotBarChartMessage: { message: Chart.Message },
  GotLineChartMessage: { message: Chart.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { barChart: Chart.init({ id: 'chart-bars' }), lineChart: Chart.init({ id: 'chart-lines' }) },
});

const toBarChartMessage = (message: Chart.Message): Message => Message.GotBarChartMessage({ message });
const toLineChartMessage = (message: Chart.Message): Message => Message.GotLineChartMessage({ message });

const foldBarChart = Update.foldChild({
  update: Chart.update,
  read: (model: Model) => Option.some(model.barChart),
  write: (model: Model, nextBarChart: Chart.Model) => modifyFields(model, { barChart: () => nextBarChart }),
  toParentMessage: toBarChartMessage,
});

const foldLineChart = Update.foldChild({
  update: Chart.update,
  read: (model: Model) => Option.some(model.lineChart),
  write: (model: Model, nextLineChart: Chart.Model) => modifyFields(model, { lineChart: () => nextLineChart }),
  toParentMessage: toLineChartMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotBarChartMessage: ({ message }) => foldBarChart(model, message),
    GotLineChartMessage: ({ message }) => foldLineChart(model, message),
  });

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'Stacked bars and lines drawn as SVG from the Model: Chart.container maps the series to --color-<key>, the tooltip and legend use our type and the tooltip surface. Series colors are chart-1 … chart-5: static, not branded. The tooltip formats values with its locale (default en-US).',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'Stacked bars, the tooltip on hover, a legend.',
            isBare: true,
            children: [
              Card.view(
                {
                  className: 'w-full max-w-2xl',
                  children: [
                    Card.header({ children: [Card.title({ children: ['Tasks closed by team'] }, h)] }, h),
                    Card.content(
                      {
                        className: 'p-card',
                        children: [
                          Chart.barChart(
                            {
                              model: model.barChart,
                              toParentMessage: toBarChartMessage,
                              series: SERIES,
                              data: DATA,
                              ariaLabel: 'Tasks closed by team',
                              className: 'aspect-auto h-64 w-full',
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
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Line',
            isBare: true,
            children: [
              Card.view(
                {
                  className: 'w-full max-w-2xl',
                  children: [
                    Card.header({ children: [Card.title({ children: ['Tasks closed'] }, h)] }, h),
                    Card.content(
                      {
                        className: 'p-card',
                        children: [
                          Chart.lineChart(
                            {
                              model: model.lineChart,
                              toParentMessage: toLineChartMessage,
                              series: LINE_SERIES,
                              data: DATA,
                              ariaLabel: 'Tasks closed',
                              className: 'aspect-auto h-56 w-full',
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
            ],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

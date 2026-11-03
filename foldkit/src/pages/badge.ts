import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, foundationSection, page, row } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Badge from '../pavo/badge.ts';
import * as Card from '../pavo/card.ts';
import { icon } from '../pavo/icon.ts';
import { INTENTS, type Intent } from '../pavo/intent.ts';
import * as Item from '../pavo/item.ts';
import type { Child } from '../pavo/part.ts';

export const title = 'Badge';
export const description = 'A state or a count, named in words.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const EMPHASES = ['subtle', 'solid', 'outline'] as const;

const SIZES = [
  { size: 'default', height: 24 },
  { size: 'sm', height: 20 },
] as const;

const DATA_COLORS = [
  { name: 'category-1', color: 'var(--category-1)', label: 'Design' },
  { name: 'category-2', color: 'var(--category-2)', label: 'Events' },
  { name: 'category-5', color: 'var(--category-5)', label: 'Hiring' },
  { name: '#0ea5e9', color: '#0ea5e9', label: 'Backend' },
] as const;

const LABEL: Record<Intent, string> = {
  neutral: 'Draft',
  primary: 'Selected',
  info: 'New',
  success: 'Done',
  warning: 'Blocked',
  destructive: 'Overdue',
};

const TASK_LABELS = [
  { name: 'Design', color: '#8b5cf6' },
  { name: 'Backend', color: '#0ea5e9' },
  { name: 'Marketing', color: '#f97316' },
  { name: 'Legal', color: '#64748b' },
] as const;

const PROJECT_TYPES = ['Client work', 'Internal', 'Research', 'Hiring', 'Events', 'Support', 'Finance', 'Training'];

type MatrixRow = Readonly<{ name: string; meta?: Html; cells: ReadonlyArray<Html> }>;

const matrix = (columns: ReadonlyArray<string>, rows: ReadonlyArray<MatrixRow>, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.content(
          {
            className: 'overflow-x-auto',
            children: [
              h.div(
                [
                  h.Class('grid min-w-fit items-center gap-x-related'),
                  h.Style({ 'grid-template-columns': `8rem repeat(${columns.length}, minmax(7.5rem, 1fr))` }),
                ],
                [
                  h.span([], []),
                  ...columns.map((column) =>
                    h.span(
                      [h.Class('px-1 pt-group pb-related font-mono text-caption text-muted-foreground')],
                      [column],
                    ),
                  ),
                  ...rows.flatMap((matrixRow) => [
                    h.div(
                      [h.Class('flex flex-col border-t border-border-subtle py-related pl-group')],
                      [
                        h.span([h.Class('text-body font-medium')], [matrixRow.name]),
                        ...(matrixRow.meta === undefined
                          ? []
                          : [h.span([h.Class('text-caption text-muted-foreground')], [matrixRow.meta])]),
                      ],
                    ),
                    ...matrixRow.cells.map((cell) =>
                      h.div(
                        [
                          h.Class(
                            'flex min-w-0 items-center border-t border-border-subtle px-1 py-related last:pr-group',
                          ),
                        ],
                        [cell],
                      ),
                    ),
                  ]),
                ],
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const badge = (config: Badge.ViewConfig<Message>, h: HtmlBuilder<Message>): Html => Badge.view(config, h);

const intentAndEmphasis = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col gap-2')],
    [
      row(
        [
          badge({ children: ['Draft'] }, h),
          badge({ intent: 'primary', children: ['Selected'] }, h),
          badge({ intent: 'info', children: ['New'] }, h),
          badge({ intent: 'success', children: ['Done'] }, h),
          badge({ intent: 'warning', children: ['Blocked'] }, h),
          badge({ intent: 'destructive', children: ['Overdue'] }, h),
        ],
        h,
      ),
      row(
        [
          badge({ intent: 'warning', emphasis: 'solid', children: ['Needs review'] }, h),
          badge({ emphasis: 'outline', children: ['Archived'] }, h),
        ],
        h,
      ),
    ],
  );

const status = (h: HtmlBuilder<Message>): Html =>
  row(
    [
      badge({ children: ['Draft'] }, h),
      badge({ intent: 'info', children: ['In review'] }, h),
      badge({ intent: 'warning', children: ['Blocked'] }, h),
      badge({ intent: 'success', children: ['Done'] }, h),
      badge({ intent: 'destructive', children: ['Overdue'] }, h),
    ],
    h,
  );

const dataColor = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col gap-2')],
    EMPHASES.map((emphasis) =>
      row(
        TASK_LABELS.map((label) => badge({ color: label.color, emphasis, children: [label.name] }, h)),
        h,
      ),
    ),
  );

const categories = (h: HtmlBuilder<Message>): Html =>
  row(
    PROJECT_TYPES.map((type, index) => badge({ color: `var(--category-${(index % 8) + 1})`, children: [type] }, h)),
    h,
  );

const withIcon = (h: HtmlBuilder<Message>): Html =>
  row(
    [
      badge({ intent: 'success', children: [icon('check'), 'Paid'] }, h),
      badge({ intent: 'warning', children: [icon('clock'), 'Due in 3 days'] }, h),
    ],
    h,
  );

const withCount = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex items-center gap-2 text-body')],
    ['Assigned to me', badge({ intent: 'primary', emphasis: 'solid', shape: 'pill', size: 'sm', children: ['3'] }, h)],
  );

const usageRow = (rowTitle: string, rowDescription: string, trailing: Html, h: HtmlBuilder<Message>): Html =>
  Item.view(
    {
      className: 'px-4',
      children: [
        Item.content(
          {
            children: [Item.title({ children: [rowTitle] }, h), Item.description({ children: [rowDescription] }, h)],
          },
          h,
        ),
        trailing,
      ],
    },
    h,
  );

const usages = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.header({ children: [Card.title({ children: ['Tasks'] }, h)] }, h),
        Card.content(
          {
            className: 'overflow-hidden',
            children: [
              Item.list(
                {
                  children: [
                    usageRow(
                      'Publish the pricing page',
                      'Website redesign · closed Mar 12',
                      badge({ intent: 'success', children: [icon('check'), 'Done'] }, h),
                      h,
                    ),
                    usageRow(
                      'Sign the vendor contract',
                      'Operations · waiting on legal',
                      badge({ intent: 'warning', emphasis: 'solid', children: ['Needs review'] }, h),
                      h,
                    ),
                    usageRow(
                      'Comments',
                      'Unread',
                      badge({ intent: 'primary', emphasis: 'solid', shape: 'pill', size: 'sm', children: ['3'] }, h),
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
  );

const section = (
  sectionTitle: string,
  sectionDescription: ReadonlyArray<Child> | string | undefined,
  child: Html,
  h: HtmlBuilder<Message>,
): Html =>
  exampleSection(
    {
      title: sectionTitle,
      ...(sectionDescription === undefined ? {} : { description: sectionDescription }),
      children: [child],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'A state or a count, named in words. An intent at subtle (the default), solid when it needs action, outline in dense lists. Pill for counts and chips. A color from data takes color instead of intent.',
      sections: [
        section('Default', undefined, badge({ intent: 'success', children: ['Done'] }, h), h),
        section(
          'Intent and emphasis',
          'An intent at subtle (the default); solid when it needs action, outline in dense lists.',
          intentAndEmphasis(h),
          h,
        ),
        section('Status', 'One intent per state.', status(h), h),
        section(
          'Data color',
          'A color the workspace picked (a label, a category) is data, not an intent: pass it as color instead of intent. Every emphasis paints from it, in both modes.',
          dataColor(h),
          h,
        ),
        section('Categories', 'Without a picked color, take the categories in order.', categories(h), h),
        section(
          'Sizes',
          '24px; sm (20px) for a count in a dense row.',
          row([badge({ children: ['Draft'] }, h), badge({ size: 'sm', children: ['Draft'] }, h)], h),
          h,
        ),
        section(
          'Shapes',
          'Rounded for a state; pill for a count or a filter chip.',
          row(
            [
              badge({ intent: 'info', children: ['New'] }, h),
              badge({ intent: 'info', shape: 'pill', children: ['New'] }, h),
            ],
            h,
          ),
          h,
        ),
        section('With icon', undefined, withIcon(h), h),
        section('With count', undefined, withCount(h), h),
        foundationSection(
          {
            title: 'Intent × emphasis',
            children: [
              matrix(
                EMPHASES,
                INTENTS.map((intent) => ({
                  name: intent,
                  cells: EMPHASES.map((emphasis) => badge({ intent, emphasis, children: [LABEL[intent]] }, h)),
                })),
                h,
              ),
            ],
          },
          h,
        ),
        foundationSection(
          {
            title: 'Data color × emphasis',
            description:
              'Solid is the color with black or white text by its lightness; subtle and outline mix it toward the text color.',
            children: [
              matrix(
                EMPHASES,
                DATA_COLORS.map(({ name, color, label }) => ({
                  name,
                  cells: EMPHASES.map((emphasis) => badge({ color, emphasis, children: [label] }, h)),
                })),
                h,
              ),
            ],
          },
          h,
        ),
        foundationSection(
          {
            title: 'Size × shape',
            description: 'Caption text at both sizes; corners rounded-control-sm.',
            children: [
              matrix(
                ['rounded', 'pill', 'with icon'],
                SIZES.map(({ size, height }) => ({
                  name: size,
                  meta: code(`${height}px`, h),
                  cells: [
                    badge({ size, intent: 'success', children: ['Done'] }, h),
                    badge({ size, shape: 'pill', children: ['12'] }, h),
                    badge({ size, intent: 'warning', children: [icon('clock'), 'Blocked'] }, h),
                  ],
                })),
                h,
              ),
            ],
          },
          h,
        ),
        foundationSection({ title: 'Usages', children: [usages(h)] }, h),
      ],
    },
    h,
  ),
);

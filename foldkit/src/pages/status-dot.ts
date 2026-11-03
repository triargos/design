import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Item from '../pavo/item.ts';
import * as StatusDot from '../pavo/status-dot.ts';

export const title = 'Status Dot';
export const description = 'The intent’s hue as a dot, next to a label.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const STATES = [
  { intent: 'neutral', label: 'Draft' },
  { intent: 'primary', label: 'Selected' },
  { intent: 'info', label: 'In review' },
  { intent: 'success', label: 'Done' },
  { intent: 'warning', label: 'Blocked' },
  { intent: 'destructive', label: 'Overdue' },
] as const;

const PROJECTS = [
  { name: 'Website redesign', owner: 'Lena Park', type: 'Client work', color: '#8b5cf6' },
  { name: 'Q3 hiring plan', owner: 'Omar Haddad', type: 'Hiring', color: 'var(--category-4)' },
  { name: 'Onboarding guide', owner: 'Mia Chen', type: 'Training', color: 'var(--category-5)' },
] as const;

const labelledRow = (
  name: string,
  rowDescription: string,
  dot: Html,
  label: string,
  h: HtmlBuilder<Message>,
  className?: string,
): Html =>
  Item.view(
    {
      className,
      children: [
        Item.content(
          { children: [Item.title({ children: [name] }, h), Item.description({ children: [rowDescription] }, h)] },
          h,
        ),
        h.span([h.Class('flex items-center gap-1.5 text-caption text-muted-foreground')], [dot, label]),
      ],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'The intent’s hue as a dot, only next to a label that names the state: in dense rows, legends and stats. The dot alone is decorative.',
      sections: [
        exampleSection(
          {
            title: 'Variants',
            children: [
              h.div(
                [h.Class('flex flex-wrap items-center gap-4 text-body')],
                STATES.map(({ intent, label }) =>
                  h.span([h.Class('flex items-center gap-1.5')], [StatusDot.view({ intent }, h), label]),
                ),
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Data color',
            description:
              'A color the workspace picked, or a category: color instead of intent, and the dot is exactly that color.',
            children: [
              h.div(
                [h.Class('flex w-96 flex-col')],
                PROJECTS.map((project) =>
                  labelledRow(
                    project.name,
                    project.owner,
                    StatusDot.view({ color: project.color }, h),
                    project.type,
                    h,
                  ),
                ),
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With label',
            description: 'In a dense row, where a badge would be too loud.',
            children: [
              labelledRow('Lena Park', 'Design', StatusDot.view({ intent: 'success' }, h), 'Online', h, 'w-80'),
            ],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

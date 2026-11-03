import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Skeleton from '../pavo/skeleton.ts';

export const title = 'Skeleton';
export const description = 'A loading region in the shape of its content.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const bone = (className: string, h: HtmlBuilder<Message>): Html => Skeleton.view({ className }, h);

const shapes = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-80 flex-col gap-4')],
    [0, 1].map(() =>
      h.div(
        [h.Class('flex items-center gap-3')],
        [
          bone('size-9 rounded-full', h),
          h.div([h.Class('flex flex-1 flex-col gap-2')], [bone('h-3.5 w-2/5', h), bone('h-3 w-3/5', h)]),
        ],
      ),
    ),
  );

const textBlock = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-96 flex-col gap-2')],
    [bone('h-4 w-1/3', h), bone('h-3 w-full', h), bone('h-3 w-full', h), bone('h-3 w-4/5', h)],
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'A loading region shows its shape in the skeleton fill, pulsing, so the page does not jump when the content arrives. Every skeleton pulses in step, whenever it mounts.',
      sections: [
        exampleSection({ title: 'Shapes', description: 'An avatar, a title, a line.', children: [shapes(h)] }, h),
        exampleSection(
          {
            title: 'Text block',
            description: 'A paragraph: full lines, the last one short.',
            children: [textBlock(h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

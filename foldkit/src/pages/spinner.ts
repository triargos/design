import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html } from 'foldkit/html';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Spinner from '../pavo/spinner.ts';

export const title = 'Spinner';
export const description = 'The spinner, in currentColor.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const SIZES = [16, 20, 24, 32] as const;

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'The spinner alone, in currentColor: inside a button it takes the label color; alone, give it a text level. Still with reduced motion.',
      sections: [
        exampleSection(
          { title: 'Default', children: [h.span([h.Class('text-muted-foreground')], [Spinner.view()])] },
          h,
        ),
        exampleSection(
          {
            title: 'Sizes',
            description: [code('size', h), ' 16 · 20 · 24 · 32'],
            children: [
              h.div(
                [h.Class('flex items-center gap-4 text-muted-foreground')],
                SIZES.map((size) => Spinner.view({ size })),
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'In a button',
            description: [
              'Use ',
              code('isPending', h),
              ', not a Spinner child: the label keeps the width; the spinner shows at least 800ms.',
            ],
            children: [Button.view({ isPending: true, children: ['Save'] }, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

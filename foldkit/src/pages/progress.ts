import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html } from 'foldkit/html';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Progress from '../pavo/progress.ts';

export const title = 'Progress';
export const description = 'Known progress, like an upload.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'Known progress, like an upload: a 4px track in the muted fill, the brand fill for what is done. For unknown progress, Spinner or Skeleton.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            children: [Progress.view({ id: 'progress-default', value: 35, ariaLabel: 'Upload', className: 'w-80' }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With label and value',
            description: [code('label · isValueShown', h)],
            children: [
              Progress.view(
                {
                  id: 'progress-labelled',
                  value: 35,
                  label: ['invoice-march.pdf'],
                  isValueShown: true,
                  className: 'w-80',
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

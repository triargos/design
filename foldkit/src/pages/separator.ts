import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html } from 'foldkit/html';

import { exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Separator from '../pavo/separator.ts';

export const title = 'Separator';
export const description = 'A hairline between groups.';

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
      description,
      sections: [
        exampleSection(
          {
            title: 'Default',
            children: [
              h.div(
                [h.Class('flex w-80 flex-col gap-4')],
                [
                  h.span([h.Class('text-body text-muted-foreground')], ['Profile']),
                  Separator.view({}, h),
                  h.span([h.Class('text-body text-muted-foreground')], ['Notifications']),
                ],
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Vertical',
            children: [
              h.div(
                [h.Class('flex h-6 items-center gap-2 text-body text-muted-foreground')],
                [
                  h.span([], ['Draft']),
                  Separator.view({ orientation: 'vertical' }, h),
                  h.span([], ['Last saved 9:30 AM']),
                ],
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

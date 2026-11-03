import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, page, row } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Kbd from '../pavo/kbd.ts';

export const title = 'Kbd';
export const description = 'A key on the keyboard.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const key = (label: string, h: HtmlBuilder<Message>): Html => Kbd.view({ children: [label] }, h);

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'A key on the keyboard, in caption on the quiet fill. In a tooltip, it names a control’s shortcut (Shortcut Tooltip).',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('20px · rounded-control-xs', h)],
            children: [
              row(
                ['⌘', 'K', 'Esc', 'Enter'].map((label) => key(label, h)),
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Combinations',
            description: [code('Kbd.group', h)],
            children: [Kbd.group({ children: ['⌘', '⇧', 'P'].map((label) => key(label, h)) }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'In running text',
            children: [
              h.p(
                [h.Class('text-body text-muted-foreground')],
                ['Press ', key('⌘', h), ' ', key('K', h), ' to search for a task.'],
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

import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Textarea from '../pavo/textarea.ts';

export const title = 'Textarea';
export const description = 'Multi-line text on the shared field surface.';

const BRIEF =
  'Goal: ship the new pricing page by the end of the quarter.\n\nScope: copy, layout and the checkout link.\n\nOut of scope: billing changes.';

export const Model = Schema.Struct({
  comment: Schema.String,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  UpdatedComment: { value: Schema.String },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { comment: '' },
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    UpdatedComment: ({ value }) => ({ model: modifyFields(model, { comment: () => value }) }),
  });

const states = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('grid w-96 gap-2')],
    [
      Textarea.view(
        {
          id: 'textarea-read-only',
          ariaLabel: 'Read-only',
          isReadOnly: true,
          defaultValue: 'The review moved to Thursday.',
        },
        h,
      ),
      Textarea.view({ id: 'textarea-invalid', ariaLabel: 'Invalid', isInvalid: true }, h),
      Textarea.view(
        {
          id: 'textarea-disabled',
          ariaLabel: 'Disabled',
          isDisabled: true,
          defaultValue: 'The review moved to Thursday.',
        },
        h,
      ),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'Multi-line text on the field surface. On a phone it renders 16px, where iOS does not zoom; in an Input Group, InputGroupTextarea.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'At least 60px; grows with rows.',
            children: [
              Textarea.view(
                {
                  id: 'textarea-default',
                  placeholder: 'Add a comment',
                  ariaLabel: 'Comment',
                  className: 'w-96',
                  value: model.comment,
                  onInput: (value) => Message.UpdatedComment({ value }),
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Tall',
            description: [code('rows: 6', h)],
            children: [
              Textarea.view(
                { id: 'textarea-tall', rows: 6, ariaLabel: 'Project brief', className: 'w-96', defaultValue: BRIEF },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection({ title: 'States', description: 'Read-only, invalid, disabled.', children: [states(h)] }, h),
      ],
    },
    h,
  ),
);

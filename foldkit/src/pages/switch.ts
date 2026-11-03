import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Field from '../pavo/field.ts';
import * as Switch from '../pavo/switch.ts';

export const title = 'Switch';
export const description = 'A setting that takes effect at once.';

export const Model = Schema.Struct({
  isActive: Schema.Boolean,
  isSmallOn: Schema.Boolean,
  isDefaultOn: Schema.Boolean,
  isRemindersOn: Schema.Boolean,
  isDigestOn: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ToggledActive: { isChecked: Schema.Boolean },
  ToggledSmall: { isChecked: Schema.Boolean },
  ToggledDefault: { isChecked: Schema.Boolean },
  ToggledReminders: { isChecked: Schema.Boolean },
  ToggledDigest: { isChecked: Schema.Boolean },
  ToggledLocked: { isChecked: Schema.Boolean },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { isActive: true, isSmallOn: true, isDefaultOn: true, isRemindersOn: false, isDigestOn: true },
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ToggledActive: ({ isChecked }) => ({ model: modifyFields(model, { isActive: () => isChecked }) }),
    ToggledSmall: ({ isChecked }) => ({ model: modifyFields(model, { isSmallOn: () => isChecked }) }),
    ToggledDefault: ({ isChecked }) => ({ model: modifyFields(model, { isDefaultOn: () => isChecked }) }),
    ToggledReminders: ({ isChecked }) => ({ model: modifyFields(model, { isRemindersOn: () => isChecked }) }),
    ToggledDigest: ({ isChecked }) => ({ model: modifyFields(model, { isDigestOn: () => isChecked }) }),
    ToggledLocked: () => ({ model }),
  });

const sizes = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex items-center gap-4')],
    [
      Switch.view(
        {
          id: 'switch-small',
          size: 'sm',
          ariaLabel: 'Small',
          isChecked: model.isSmallOn,
          onToggle: (isChecked) => Message.ToggledSmall({ isChecked }),
        },
        h,
      ),
      Switch.view(
        {
          id: 'switch-default-size',
          ariaLabel: 'Default',
          isChecked: model.isDefaultOn,
          onToggle: (isChecked) => Message.ToggledDefault({ isChecked }),
        },
        h,
      ),
    ],
  );

const withLabel = (model: Model, h: HtmlBuilder<Message>): Html =>
  Switch.view(
    {
      id: 'switch-reminders',
      isChecked: model.isRemindersOn,
      onToggle: (isChecked) => Message.ToggledReminders({ isChecked }),
      toView: (render) =>
        Field.view(
          {
            orientation: 'horizontal',
            className: 'w-72',
            children: [Field.label({ attributes: render.label, children: ['Due date reminders'] }, h), render.switch],
          },
          h,
        ),
    },
    h,
  );

const withDescription = (model: Model, h: HtmlBuilder<Message>): Html =>
  Switch.view(
    {
      id: 'switch-digest',
      isChecked: model.isDigestOn,
      hasDescription: true,
      onToggle: (isChecked) => Message.ToggledDigest({ isChecked }),
      toView: (render) =>
        Field.view(
          {
            orientation: 'horizontal',
            className: 'max-w-md',
            children: [
              Field.content(
                {
                  children: [
                    Field.label({ attributes: render.label, children: ['Daily digest'] }, h),
                    Field.description(
                      {
                        attributes: render.description,
                        children: ['One email in the morning instead of one per update.'],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              render.switch,
            ],
          },
          h,
        ),
    },
    h,
  );

const disabled = (h: HtmlBuilder<Message>): Html =>
  Switch.view(
    {
      id: 'switch-locked',
      isChecked: true,
      isDisabled: true,
      onToggle: (isChecked) => Message.ToggledLocked({ isChecked }),
      toView: (render) =>
        Field.view(
          {
            orientation: 'horizontal',
            isDisabled: true,
            className: 'w-72',
            children: [
              Field.label({ attributes: render.label, children: ['Set by the workspace owner'] }, h),
              render.switch,
            ],
          },
          h,
        ),
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A setting that takes effect at once. Flat: a veil track and a white thumb off, the brand fill on. No edges, no shadows.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            children: [
              Switch.view(
                {
                  id: 'switch-active',
                  ariaLabel: 'Active',
                  isChecked: model.isActive,
                  onToggle: (isChecked) => Message.ToggledActive({ isChecked }),
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          { title: 'Sizes', description: [code('default 20×36 · sm 16×28', h)], children: [sizes(model, h)] },
          h,
        ),
        exampleSection(
          {
            title: 'With label',
            description: [code("Field.view({ orientation: 'horizontal' })", h), ', the switch at the end.'],
            children: [withLabel(model, h)],
          },
          h,
        ),
        exampleSection({ title: 'With description', children: [withDescription(model, h)] }, h),
        exampleSection({ title: 'Disabled', children: [disabled(h)] }, h),
      ],
    },
    h,
  ),
);

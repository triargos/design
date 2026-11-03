import { Array, Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import { icon } from '../pavo/icon.ts';
import * as InputGroup from '../pavo/input-group.ts';
import * as Toggle from '../pavo/toggle.ts';

export const title = 'Toggle';
export const description = 'A button that stays pressed: a filter, a mark, a flag.';

export const Model = Schema.Struct({
  pressedToggles: Schema.Array(Schema.String),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ToggledPressed: { toggleId: Schema.String, isPressed: Schema.Boolean },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    pressedToggles: ['size-sm', 'size-default', 'size-lg', 'size-icon-sm', 'size-icon', 'size-icon-lg', 'bold'],
  },
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ToggledPressed: ({ toggleId, isPressed }) => ({
      model: modifyFields(model, {
        pressedToggles: (pressedToggles) =>
          isPressed
            ? Array.union(pressedToggles, [toggleId])
            : Array.filter(pressedToggles, (current) => current !== toggleId),
      }),
    }),
  });

const isPressed = (model: Model, toggleId: string): boolean => Array.contains(model.pressedToggles, toggleId);

const toggleFor = (model: Model) => (toggleId: string) => ({
  isPressed: isPressed(model, toggleId),
  onPressedChange: (nextIsPressed: boolean) => Message.ToggledPressed({ toggleId, isPressed: nextIsPressed }),
});

const archivedLabel = (): ReadonlyArray<Html | string> => [icon('archive', { dataIcon: 'inline-start' }), 'Archived'];

const sizes = (model: Model, h: HtmlBuilder<Message>): Html => {
  const pressedState = toggleFor(model);
  return h.div(
    [h.Class('flex flex-wrap items-center gap-2')],
    [
      Toggle.view({ ...pressedState('size-sm'), size: 'sm', children: ['Starred'] }, h),
      Toggle.view({ ...pressedState('size-default'), children: ['Starred'] }, h),
      Toggle.view({ ...pressedState('size-lg'), size: 'lg', children: ['Starred'] }, h),
      Toggle.view(
        { ...pressedState('size-icon-sm'), size: 'icon-sm', ariaLabel: 'Starred', children: [icon('star')] },
        h,
      ),
      Toggle.view({ ...pressedState('size-icon'), size: 'icon', ariaLabel: 'Starred', children: [icon('star')] }, h),
      Toggle.view(
        { ...pressedState('size-icon-lg'), size: 'icon-lg', ariaLabel: 'Starred', children: [icon('star')] },
        h,
      ),
    ],
  );
};

const toolbar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const pressedState = toggleFor(model);
  return h.div(
    [h.Class('flex items-center gap-0.5 text-muted-foreground')],
    [
      Toggle.view({ ...pressedState('bold'), size: 'icon-sm', ariaLabel: 'Bold', children: [icon('bold')] }, h),
      Toggle.view({ ...pressedState('italic'), size: 'icon-sm', ariaLabel: 'Italic', children: [icon('italic')] }, h),
      Toggle.view(
        { ...pressedState('underline'), size: 'icon-sm', ariaLabel: 'Underline', children: [icon('underline')] },
        h,
      ),
    ],
  );
};

const inAHeader = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-xl flex-wrap items-center justify-between gap-related')],
    [
      h.h2([h.Class('text-heading')], [isPressed(model, 'header-archived') ? 'Archived projects' : 'Projects']),
      h.div(
        [h.Class('flex items-center gap-related')],
        [
          InputGroup.view(
            {
              className: 'w-56',
              children: [
                InputGroup.addon({ children: [icon('search')] }, h),
                InputGroup.input(
                  { id: 'toggle-search-projects', placeholder: 'Search projects', ariaLabel: 'Search projects' },
                  h,
                ),
              ],
            },
            h,
          ),
          Toggle.view({ ...toggleFor(model)('header-archived'), children: archivedLabel() }, h),
        ],
      ),
    ],
  );

const disabled = (model: Model, h: HtmlBuilder<Message>): Html => {
  const pressedState = toggleFor(model);
  return h.div(
    [h.Class('flex flex-wrap items-center gap-2')],
    [
      Toggle.view(
        { ...pressedState('disabled-off'), isPressed: false, isDisabled: true, children: archivedLabel() },
        h,
      ),
      Toggle.view({ ...pressedState('disabled-on'), isPressed: true, isDisabled: true, children: archivedLabel() }, h),
    ],
  );
};

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A button that stays pressed: a filter, a mark, a flag. A neutral ghost at rest, a quiet fill while pressed. An action is a Button; a setting that applies at once is a Switch.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('isPressed', h), ' + ', code('onPressedChange', h), '.'],
            children: [Toggle.view({ ...toggleFor(model)('archived'), children: archivedLabel() }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Sizes',
            description: [
              'As ',
              code('Button', h),
              ': ',
              code('xs 24 · sm 32 · default 36 · lg 40', h),
              ', and ',
              code('icon-*', h),
              '.',
            ],
            children: [sizes(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Toolbar',
            description: [
              'Icon only, each with an ',
              code('ariaLabel', h),
              '; at rest it takes the toolbar’s text color.',
            ],
            children: [toolbar(model, h)],
          },
          h,
        ),
        exampleSection(
          { title: 'In a header', description: 'A filter beside the search.', children: [inAHeader(model, h)] },
          h,
        ),
        exampleSection({ title: 'Disabled', children: [disabled(model, h)] }, h),
      ],
    },
    h,
  ),
);

import { Array, Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, foundationSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Card from '../pavo/card.ts';
import { cn } from '../pavo/cn.ts';
import * as Field from '../pavo/field.ts';
import { icon } from '../pavo/icon.ts';
import * as Input from '../pavo/input.ts';
import * as InputGroup from '../pavo/input-group.ts';
import * as Textarea from '../pavo/textarea.ts';

export const title = 'Input';
export const description = 'A single-line text field on the shared field surface.';

export const Model = Schema.Struct({
  name: Schema.String,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  UpdatedName: { value: Schema.String },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { name: '' },
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    UpdatedName: ({ value }) => ({ model: modifyFields(model, { name: () => value }) }),
  });

type FieldState = 'empty' | 'filled' | 'read-only' | 'invalid' | 'disabled';

const STATES: ReadonlyArray<FieldState> = ['empty', 'filled', 'read-only', 'invalid', 'disabled'];

const stateConfig = (state: FieldState) => ({
  isInvalid: state === 'invalid',
  isDisabled: state === 'disabled',
  isReadOnly: state === 'read-only',
});

const filledValue = (state: FieldState, value: string) => (state === 'empty' ? {} : { defaultValue: value });

type FieldSpecimen = Readonly<{
  name: string;
  meta: string;
  render: (state: FieldState, h: HtmlBuilder<Message>) => Html;
}>;

const FIELDS: ReadonlyArray<FieldSpecimen> = [
  {
    name: 'Input',
    meta: '32px, text-control; 36px and 16px below sm',
    render: (state, h) =>
      Input.view(
        {
          id: `fields-input-${state}`,
          ariaLabel: 'Name',
          placeholder: 'Maya Chen',
          ...filledValue(state, 'Maya Chen'),
          ...stateConfig(state),
        },
        h,
      ),
  },
  {
    name: 'Textarea',
    meta: 'min 60px, grows with rows',
    render: (state, h) =>
      Textarea.view(
        {
          id: `fields-textarea-${state}`,
          ariaLabel: 'Comment',
          placeholder: 'Add a comment',
          ...filledValue(state, 'The review moved to Thursday.'),
          ...stateConfig(state),
        },
        h,
      ),
  },
  {
    name: 'InputGroup',
    meta: 'the group owns surface, focus and invalid',
    render: (state, h) =>
      InputGroup.view(
        {
          isDisabled: state === 'disabled',
          children: [
            InputGroup.addon({ children: [icon('search')] }, h),
            InputGroup.input(
              {
                id: `fields-group-${state}`,
                ariaLabel: 'Search',
                placeholder: 'Search',
                ...filledValue(state, 'Chen'),
                ...stateConfig(state),
              },
              h,
            ),
          ],
        },
        h,
      ),
  },
];

const stateCell = (state: FieldState, child: Html, h: HtmlBuilder<Message>): Html =>
  h.div([h.Class('flex flex-col gap-related')], [code(state, h), child]);

const specimenRow = ({ name, meta, render }: FieldSpecimen, h: HtmlBuilder<Message>): Html =>
  h.keyed('div')(
    name,
    [
      h.Class(
        'grid gap-related border-t border-border p-group first:border-t-0 md:grid-cols-[11rem_1fr] md:items-center md:gap-group',
      ),
    ],
    [
      h.div(
        [h.Class('flex flex-col')],
        [
          h.span([h.Class('text-body font-medium')], [name]),
          h.span([h.Class('text-caption text-muted-foreground')], [meta]),
        ],
      ),
      h.div(
        [h.Class('min-w-0')],
        [
          h.div(
            [h.Class('grid min-w-0 grid-cols-1 gap-related sm:grid-cols-2 lg:grid-cols-5')],
            Array.map(STATES, (state) => stateCell(state, render(state, h), h)),
          ),
        ],
      ),
    ],
  );

const fieldsMatrix = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.content(
          {
            className: 'flex flex-col overflow-hidden',
            children: Array.map(FIELDS, (specimen) => specimenRow(specimen, h)),
          },
          h,
        ),
      ],
    },
    h,
  );

type Surface = Readonly<{ label: string; surface?: 'card' | 'popup'; className: string }>;

const SURFACES: ReadonlyArray<Surface> = [
  { label: 'page', className: 'bg-background ring-1 ring-border' },
  { label: 'shell', className: 'bg-shell' },
  { label: 'card', surface: 'card', className: 'border border-(--edge) bg-card bg-clip-padding' },
  { label: 'popup', surface: 'popup', className: 'rounded-popup bg-popover text-popover-foreground shadow-popup' },
];

const surfaceSample = ({ label, surface, className }: Surface, h: HtmlBuilder<Message>): Html =>
  h.keyed('div')(
    label,
    [h.Class('flex flex-col gap-related')],
    [
      code(label, h),
      h.div(
        [
          ...(surface === undefined ? [] : [h.DataAttribute('surface', surface)]),
          h.Class(cn('rounded-[24px] p-group', className)),
        ],
        [Input.view({ id: `surface-${label}-name`, placeholder: 'Maya Chen', ariaLabel: 'Name' }, h)],
      ),
    ],
  );

const withLabel = (h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      className: 'w-80',
      children: [
        Field.label({ forId: 'input-email', children: ['Email'] }, h),
        Input.view({ id: 'input-email', type: 'email', placeholder: 'name@example.com', hasDescription: true }, h),
        Field.description(
          {
            attributes: [h.Id(Input.descriptionId('input-email'))],
            children: ['We send the invitation to this address.'],
          },
          h,
        ),
      ],
    },
    h,
  );

const file = (h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      className: 'w-80',
      children: [
        Field.label({ forId: 'input-invoice', children: ['Invoice'] }, h),
        Input.view({ id: 'input-invoice', type: 'file' }, h),
      ],
    },
    h,
  );

const states = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('grid w-72 gap-2')],
    [
      Input.view({ id: 'input-read-only', ariaLabel: 'Read-only', isReadOnly: true, defaultValue: 'Maya Chen' }, h),
      Input.view({ id: 'input-invalid', ariaLabel: 'Invalid', isInvalid: true, defaultValue: 'maya@' }, h),
      Input.view({ id: 'input-disabled', ariaLabel: 'Disabled', isDisabled: true, defaultValue: 'Maya Chen' }, h),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'One field surface for every control that takes text or a choice: same height, edge, focus and error.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: '32px, text-control; 36px and 16px below sm, so iOS does not zoom.',
            children: [
              Input.view(
                {
                  id: 'input-default',
                  placeholder: 'Maya Chen',
                  ariaLabel: 'Name',
                  className: 'w-72',
                  value: model.name,
                  onInput: (value) => Message.UpdatedName({ value }),
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With label',
            description: [code('Field · FieldLabel · FieldDescription', h)],
            children: [withLabel(h)],
          },
          h,
        ),
        exampleSection({ title: 'File', children: [file(h)] }, h),
        exampleSection(
          {
            title: 'States',
            description:
              'Read-only keeps the text selectable and never rings; invalid turns the edge; disabled drops the lift.',
            children: [states(h)],
          },
          h,
        ),
        foundationSection(
          {
            title: 'Fields',
            description: 'Each row: empty, filled, read-only, invalid, disabled. Focus: Tab into one.',
            children: [fieldsMatrix(h)],
          },
          h,
        ),
        foundationSection(
          {
            title: 'On surfaces',
            description: 'The field fill is the surface’s own color; the edge carries it.',
            children: [
              h.div(
                [h.Class('grid gap-group md:grid-cols-2 xl:grid-cols-4')],
                Array.map(SURFACES, (surface) => surfaceSample(surface, h)),
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

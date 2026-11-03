import { Array, Option, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, foundationSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Card from '../pavo/card.ts';
import { cn } from '../pavo/cn.ts';
import * as Combobox from '../pavo/combobox.ts';
import * as Field from '../pavo/field.ts';
import { icon } from '../pavo/icon.ts';
import * as Input from '../pavo/input.ts';
import * as InputGroup from '../pavo/input-group.ts';
import * as Select from '../pavo/select.ts';
import * as Textarea from '../pavo/textarea.ts';

export const title = 'Input';
export const description = 'A single-line text field on the shared field surface.';

const FieldState = Schema.Literals(['empty', 'filled', 'read-only', 'invalid', 'disabled']);
type FieldState = typeof FieldState.Type;
const STATES = FieldState.literals;

const SurfaceLabel = Schema.Literals(['page', 'shell', 'card', 'popup']);
type SurfaceLabel = typeof SurfaceLabel.Type;

const TEAMS: ReadonlyArray<Select.SelectOption> = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
];

const TeamSelect = Schema.Struct({ select: Select.Model, maybeValue: Schema.Option(Schema.String) });
type TeamSelect = typeof TeamSelect.Type;

const TeamChips = Schema.Struct({ combobox: Combobox.Model, values: Schema.Array(Schema.String) });
type TeamChips = typeof TeamChips.Type;

export const Model = Schema.Struct({
  name: Schema.String,
  fieldSelects: Schema.Record(FieldState, TeamSelect),
  fieldChips: Schema.Record(FieldState, TeamChips),
  surfaceSelects: Schema.Record(SurfaceLabel, TeamSelect),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  UpdatedName: { value: Schema.String },
  GotFieldSelectMessage: { state: FieldState, message: Select.Message },
  GotFieldChipsMessage: { state: FieldState, message: Combobox.Message },
  ClickedRemoveTeamChip: { state: FieldState, value: Schema.String },
  GotSurfaceSelectMessage: { surface: SurfaceLabel, message: Select.Message },
});
export type Message = typeof Message.Type;

const initTeamSelect = (id: string, isFilled: boolean): TeamSelect => ({
  select: Select.init({ id }),
  maybeValue: isFilled ? Option.some('design') : Option.none(),
});

const initFieldSelect = (state: FieldState): TeamSelect => initTeamSelect(`fields-select-${state}`, state !== 'empty');

const initFieldChips = (state: FieldState): TeamChips => ({
  combobox: Combobox.initMultiple({ id: `fields-chips-${state}` }),
  values: state === 'empty' ? [] : ['design', 'engineering'],
});

const initSurfaceSelect = (surface: SurfaceLabel): TeamSelect => initTeamSelect(`surface-${surface}-team`, true);

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    name: '',
    fieldSelects: {
      empty: initFieldSelect('empty'),
      filled: initFieldSelect('filled'),
      'read-only': initFieldSelect('read-only'),
      invalid: initFieldSelect('invalid'),
      disabled: initFieldSelect('disabled'),
    },
    fieldChips: {
      empty: initFieldChips('empty'),
      filled: initFieldChips('filled'),
      'read-only': initFieldChips('read-only'),
      invalid: initFieldChips('invalid'),
      disabled: initFieldChips('disabled'),
    },
    surfaceSelects: {
      page: initSurfaceSelect('page'),
      shell: initSurfaceSelect('shell'),
      card: initSurfaceSelect('card'),
      popup: initSurfaceSelect('popup'),
    },
  },
});

const writeFieldSelect = (model: Model, state: FieldState, next: TeamSelect): Model =>
  modifyFields(model, { fieldSelects: (selects) => ({ ...selects, [state]: next }) });

const writeFieldChips = (model: Model, state: FieldState, next: TeamChips): Model =>
  modifyFields(model, { fieldChips: (chips) => ({ ...chips, [state]: next }) });

const writeSurfaceSelect = (model: Model, surface: SurfaceLabel, next: TeamSelect): Model =>
  modifyFields(model, { surfaceSelects: (selects) => ({ ...selects, [surface]: next }) });

const teamSelectOutMessage = (write: (model: Model, toNext: (teamSelect: TeamSelect) => TeamSelect) => Model) =>
  Select.OutMessage.match<Update.Step<Model, Message>>({
    Selected:
      ({ value }) =>
      (stepModel) => ({
        model: write(stepModel, (teamSelect) => ({ ...teamSelect, maybeValue: Option.some(value) })),
      }),
    ChoseCustom: () => (stepModel) => ({ model: stepModel }),
  });

const foldFieldSelect = Update.foldChildAt({
  update: Select.update,
  readAt: (model: Model, state: FieldState) => Option.some(model.fieldSelects[state].select),
  writeAt: (model: Model, state: FieldState, nextSelect: Select.Model): Model =>
    writeFieldSelect(model, state, { ...model.fieldSelects[state], select: nextSelect }),
  toParentMessage: (state: FieldState, message: Select.Message) => Message.GotFieldSelectMessage({ state, message }),
  foldOutMessage: (state: FieldState) =>
    teamSelectOutMessage((model, toNext) => writeFieldSelect(model, state, toNext(model.fieldSelects[state]))),
});

const foldSurfaceSelect = Update.foldChildAt({
  update: Select.update,
  readAt: (model: Model, surface: SurfaceLabel) => Option.some(model.surfaceSelects[surface].select),
  writeAt: (model: Model, surface: SurfaceLabel, nextSelect: Select.Model): Model =>
    writeSurfaceSelect(model, surface, { ...model.surfaceSelects[surface], select: nextSelect }),
  toParentMessage: (surface: SurfaceLabel, message: Select.Message) =>
    Message.GotSurfaceSelectMessage({ surface, message }),
  foldOutMessage: (surface: SurfaceLabel) =>
    teamSelectOutMessage((model, toNext) => writeSurfaceSelect(model, surface, toNext(model.surfaceSelects[surface]))),
});

const foldFieldChips = Update.foldChildAt({
  update: Combobox.updateMultiple,
  readAt: (model: Model, state: FieldState) => Option.some(model.fieldChips[state].combobox),
  writeAt: (model: Model, state: FieldState, nextCombobox: Combobox.Model): Model =>
    writeFieldChips(model, state, { ...model.fieldChips[state], combobox: nextCombobox }),
  toParentMessage: (state: FieldState, message: Combobox.Message) => Message.GotFieldChipsMessage({ state, message }),
  foldOutMessage: (state: FieldState) =>
    Combobox.OutMessage.match<Update.Step<Model, Message>>({
      Selected:
        ({ value }) =>
        (stepModel) => ({
          model: writeFieldChips(stepModel, state, {
            ...stepModel.fieldChips[state],
            values: Combobox.toggledValues(stepModel.fieldChips[state].values, value),
          }),
        }),
      Cleared: () => (stepModel) => ({ model: stepModel }),
    }),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    UpdatedName: ({ value }) => ({ model: modifyFields(model, { name: () => value }) }),
    GotFieldSelectMessage: ({ state, message }) => foldFieldSelect(model, state, message),
    GotFieldChipsMessage: ({ state, message }) => foldFieldChips(model, state, message),
    ClickedRemoveTeamChip: ({ state, value }) => ({
      model: writeFieldChips(model, state, {
        ...model.fieldChips[state],
        values: Array.filter(model.fieldChips[state].values, (current) => current !== value),
      }),
    }),
    GotSurfaceSelectMessage: ({ surface, message }) => foldSurfaceSelect(model, surface, message),
  });

const stateConfig = (state: FieldState) => ({
  isInvalid: state === 'invalid',
  isDisabled: state === 'disabled',
  isReadOnly: state === 'read-only',
});

const filledValue = (state: FieldState, value: string) => (state === 'empty' ? {} : { defaultValue: value });

type FieldSpecimen = Readonly<{
  name: string;
  meta: string;
  render: (model: Model, state: FieldState, h: HtmlBuilder<Message>) => Html;
}>;

const teamSelect = (
  teamSelectModel: TeamSelect,
  toParentMessage: (message: Select.Message) => Message,
  state: FieldState,
  h: HtmlBuilder<Message>,
): Html =>
  Select.view(
    {
      model: teamSelectModel.select,
      toParentMessage,
      options: TEAMS,
      maybeValue: teamSelectModel.maybeValue,
      placeholder: 'Choose a team',
      ariaLabel: 'Team',
      ...stateConfig(state),
    },
    h,
  );

const teamChips = (model: Model, state: FieldState, h: HtmlBuilder<Message>): Html => {
  const { combobox, values } = model.fieldChips[state];
  return Combobox.multiple(
    {
      model: combobox,
      toParentMessage: (message) => Message.GotFieldChipsMessage({ state, message }),
      options: TEAMS,
      values,
      onRemove: (value) => Message.ClickedRemoveTeamChip({ state, value }),
      emptyText: 'No teams found',
      ariaLabel: 'Teams',
      ...(Array.isReadonlyArrayEmpty(values) ? { placeholder: 'Choose teams' } : {}),
      ...stateConfig(state),
    },
    h,
  );
};

const FIELDS: ReadonlyArray<FieldSpecimen> = [
  {
    name: 'Input',
    meta: '32px, text-control; 36px and 16px below sm',
    render: (_model, state, h) =>
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
    render: (_model, state, h) =>
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
    name: 'Select',
    meta: 'SelectTrigger',
    render: (model, state, h) =>
      teamSelect(model.fieldSelects[state], (message) => Message.GotFieldSelectMessage({ state, message }), state, h),
  },
  {
    name: 'Combobox chips',
    meta: '32px chips, 4px in, rounded-inner',
    render: teamChips,
  },
  {
    name: 'InputGroup',
    meta: 'the group owns surface, focus and invalid',
    render: (_model, state, h) =>
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

const specimenRow = (model: Model, { name, meta, render }: FieldSpecimen, h: HtmlBuilder<Message>): Html =>
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
            Array.map(STATES, (state) => stateCell(state, render(model, state, h), h)),
          ),
        ],
      ),
    ],
  );

const fieldsMatrix = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.content(
          {
            className: 'flex flex-col overflow-hidden',
            children: Array.map(FIELDS, (specimen) => specimenRow(model, specimen, h)),
          },
          h,
        ),
      ],
    },
    h,
  );

type Surface = Readonly<{ label: SurfaceLabel; surface?: 'card' | 'popup'; className: string }>;

const SURFACES: ReadonlyArray<Surface> = [
  { label: 'page', className: 'bg-background ring-1 ring-border' },
  { label: 'shell', className: 'bg-shell' },
  { label: 'card', surface: 'card', className: 'border border-(--edge) bg-card bg-clip-padding' },
  { label: 'popup', surface: 'popup', className: 'rounded-popup bg-popover text-popover-foreground shadow-popup' },
];

const surfaceSample = (model: Model, { label, surface, className }: Surface, h: HtmlBuilder<Message>): Html =>
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
        [
          h.div(
            [h.Class('flex flex-col gap-related')],
            [
              Input.view({ id: `surface-${label}-name`, placeholder: 'Maya Chen', ariaLabel: 'Name' }, h),
              teamSelect(
                model.surfaceSelects[label],
                (message) => Message.GotSurfaceSelectMessage({ surface: label, message }),
                'filled',
                h,
              ),
            ],
          ),
        ],
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
            children: [fieldsMatrix(model, h)],
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
                Array.map(SURFACES, (surface) => surfaceSample(model, surface, h)),
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

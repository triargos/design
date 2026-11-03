import { Array, Option, Schema, String } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Field from '../pavo/field.ts';
import * as Select from '../pavo/select.ts';

export const title = 'Select';
export const description = 'A field that opens a short list of options.';

const STATUSES: ReadonlyArray<Select.SelectOption> = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const TEAMS: ReadonlyArray<Select.Group> = [
  {
    label: 'Design',
    options: [
      { value: 'atlas', label: 'Atlas' },
      { value: 'beacon', label: 'Beacon' },
    ],
  },
  {
    label: 'Engineering',
    options: [
      { value: 'comet', label: 'Comet' },
      { value: 'orbit', label: 'Orbit' },
    ],
  },
];

const SOURCES: ReadonlyArray<Select.SelectOption> = [
  { value: 'search', label: 'Search engine' },
  { value: 'referral', label: 'A colleague' },
  { value: 'event', label: 'An event' },
];

const ROLES: ReadonlyArray<Select.SelectOption> = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'guest', label: 'Guest' },
];

const SOURCE_CUSTOM_LABEL = 'Other source';

const StatefulSelect = Schema.Struct({ select: Select.Model, maybeValue: Schema.Option(Schema.String) });
type StatefulSelect = typeof StatefulSelect.Type;

const CustomSelect = Schema.Struct({ select: Select.Model, maybeChoice: Schema.Option(Select.Choice) });
type CustomSelect = typeof CustomSelect.Type;

export const Model = Schema.Struct({
  status: StatefulSelect,
  project: StatefulSelect,
  source: CustomSelect,
  fieldSource: CustomSelect,
  roleStates: Schema.Array(Select.Model),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotStatusMessage: { message: Select.Message },
  GotProjectMessage: { message: Select.Message },
  GotSourceMessage: { message: Select.Message },
  GotFieldSourceMessage: { message: Select.Message },
  GotRoleStateMessage: { index: Schema.Number, message: Select.Message },
  ChangedSourceText: { text: Schema.String },
  ChangedFieldSourceText: { text: Schema.String },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    status: { select: Select.init({ id: 'select-status' }), maybeValue: Option.some('in-progress') },
    project: { select: Select.init({ id: 'select-project' }), maybeValue: Option.some('beacon') },
    source: {
      select: Select.init({ id: 'source' }),
      maybeChoice: Option.some(Select.Choice.Custom({ text: 'A podcast' })),
    },
    fieldSource: {
      select: Select.init({ id: 'field-source' }),
      maybeChoice: Option.some(Select.Choice.Custom({ text: '' })),
    },
    roleStates: Array.makeBy(4, (index) => Select.init({ id: `select-role-state-${index}` })),
  },
});

const toStatusMessage = (message: Select.Message): Message => Message.GotStatusMessage({ message });
const toProjectMessage = (message: Select.Message): Message => Message.GotProjectMessage({ message });
const toSourceMessage = (message: Select.Message): Message => Message.GotSourceMessage({ message });
const toFieldSourceMessage = (message: Select.Message): Message => Message.GotFieldSourceMessage({ message });

type StatefulKey = 'status' | 'project';
type CustomKey = 'source' | 'fieldSource';

const writeStateful = (model: Model, key: StatefulKey, next: StatefulSelect): Model => ({ ...model, [key]: next });
const writeCustom = (model: Model, key: CustomKey, next: CustomSelect): Model => ({ ...model, [key]: next });

const foldStatefulSelect = (key: StatefulKey, toParentMessage: (message: Select.Message) => Message) =>
  Update.foldChild({
    update: Select.update,
    read: (model: Model) => Option.some(model[key].select),
    write: (model: Model, nextSelect: Select.Model) => writeStateful(model, key, { ...model[key], select: nextSelect }),
    toParentMessage,
    foldOutMessage: Select.OutMessage.match<Update.Step<Model, Message>>({
      Selected:
        ({ value }) =>
        (stepModel) => ({
          model: writeStateful(stepModel, key, { ...stepModel[key], maybeValue: Option.some(value) }),
        }),
      ChoseCustom: () => (stepModel) => ({ model: stepModel }),
    }),
  });

const foldCustomSelect = (key: CustomKey, toParentMessage: (message: Select.Message) => Message) =>
  Update.foldChild({
    update: Select.update,
    read: (model: Model) => Option.some(model[key].select),
    write: (model: Model, nextSelect: Select.Model) => writeCustom(model, key, { ...model[key], select: nextSelect }),
    toParentMessage,
    foldOutMessage: Select.OutMessage.match<Update.Step<Model, Message>>({
      Selected:
        ({ value }) =>
        (stepModel) => ({
          model: writeCustom(stepModel, key, {
            ...stepModel[key],
            maybeChoice: Option.some(Select.Choice.Listed({ value })),
          }),
        }),
      ChoseCustom: () => (stepModel) => ({
        model: writeCustom(stepModel, key, {
          ...stepModel[key],
          maybeChoice: Option.some(Select.Choice.Custom({ text: '' })),
        }),
      }),
    }),
  });

const foldStatus = foldStatefulSelect('status', toStatusMessage);
const foldProject = foldStatefulSelect('project', toProjectMessage);
const foldSource = foldCustomSelect('source', toSourceMessage);
const foldFieldSource = foldCustomSelect('fieldSource', toFieldSourceMessage);

const foldRoleState = Update.foldChildAt({
  update: Select.update,
  readAt: (model: Model, index: number) => Array.get(model.roleStates, index),
  writeAt: (model: Model, index: number, nextSelect: Select.Model): Model =>
    modifyFields(model, {
      roleStates: () =>
        Array.map(model.roleStates, (select, selectIndex) => (selectIndex === index ? nextSelect : select)),
    }),
  toParentMessage: (index: number, message: Select.Message) => Message.GotRoleStateMessage({ index, message }),
  foldOutMessage: () =>
    Select.OutMessage.match<Update.Step<Model, Message>>({
      Selected: () => (stepModel) => ({ model: stepModel }),
      ChoseCustom: () => (stepModel) => ({ model: stepModel }),
    }),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotStatusMessage: ({ message }) => foldStatus(model, message),
    GotProjectMessage: ({ message }) => foldProject(model, message),
    GotSourceMessage: ({ message }) => foldSource(model, message),
    GotFieldSourceMessage: ({ message }) => foldFieldSource(model, message),
    GotRoleStateMessage: ({ index, message }) => foldRoleState(model, index, message),
    ChangedSourceText: ({ text }) => ({
      model: writeCustom(model, 'source', {
        ...model.source,
        maybeChoice: Option.some(Select.Choice.Custom({ text })),
      }),
    }),
    ChangedFieldSourceText: ({ text }) => ({
      model: writeCustom(model, 'fieldSource', {
        ...model.fieldSource,
        maybeChoice: Option.some(Select.Choice.Custom({ text })),
      }),
    }),
  });

const isCustom = (maybeChoice: Option.Option<Select.Choice>): boolean =>
  Option.exists(maybeChoice, Select.Choice.guards.Custom);

const listedValue = (maybeChoice: Option.Option<Select.Choice>): Option.Option<string> =>
  Option.flatMap(maybeChoice, (choice) =>
    Select.Choice.match(choice, { Listed: ({ value }) => Option.some(value), Custom: () => Option.none() }),
  );

const customSelect = (
  customSelectModel: CustomSelect,
  toParentMessage: (message: Select.Message) => Message,
  onInput: (text: string) => Message,
  isInvalid: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const { select, maybeChoice } = customSelectModel;
  const isCustomChosen = isCustom(maybeChoice);
  return h.div(
    [],
    [
      Select.view(
        {
          model: select,
          toParentMessage,
          options: SOURCES,
          maybeValue: listedValue(maybeChoice),
          isCustomChosen,
          allowCustom: true,
          customLabel: SOURCE_CUSTOM_LABEL,
          placeholder: 'Choose a source',
          isInvalid: isInvalid && !isCustomChosen,
        },
        h,
      ),
      Select.customInput(
        {
          selectId: select.id,
          value: isCustomChosen ? Select.choiceText(maybeChoice) : '',
          onInput,
          isShown: isCustomChosen,
          label: SOURCE_CUSTOM_LABEL,
          placeholder: 'Tell us where',
          isInvalid: isInvalid && isCustomChosen,
        },
        h,
      ),
    ],
  );
};

const STATES = [
  { label: 'Role', maybeValue: Option.none(), isInvalid: false, isReadOnly: false, isDisabled: false },
  { label: 'Role, invalid', maybeValue: Option.none(), isInvalid: true, isReadOnly: false, isDisabled: false },
  {
    label: 'Role, read-only',
    maybeValue: Option.some('member'),
    isInvalid: false,
    isReadOnly: true,
    isDisabled: false,
  },
  { label: 'Role, disabled', maybeValue: Option.some('member'), isInvalid: false, isReadOnly: false, isDisabled: true },
] as const;

const states = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('grid w-56 gap-2')],
    Array.zipWith(model.roleStates, STATES, (select, state) => ({ select, state })).map(({ select, state }, index) =>
      Select.view(
        {
          model: select,
          toParentMessage: (message) => Message.GotRoleStateMessage({ index, message }),
          options: ROLES,
          maybeValue: state.maybeValue,
          placeholder: 'Choose a role',
          ariaLabel: state.label,
          isInvalid: state.isInvalid,
          isReadOnly: state.isReadOnly,
          isDisabled: state.isDisabled,
        },
        h,
      ),
    ),
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html => {
  const isFieldSourceInvalid = String.isEmpty(String.trim(Select.choiceText(model.fieldSource.maybeChoice)));
  return page(
    {
      title,
      description:
        'A field that opens a short list of options, no typing. Values are strings; options give the trigger its labels. To search, or for a long list, Combobox.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('Select.view({ options, maybeValue })', h), ' on a Listbox Submodel.'],
            children: [
              Select.view(
                {
                  model: model.status.select,
                  toParentMessage: toStatusMessage,
                  options: STATUSES,
                  maybeValue: model.status.maybeValue,
                  ariaLabel: 'Status',
                  className: 'w-56',
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Grouped',
            description: [code('groups', h), ': a label per group, a separator between groups.'],
            children: [
              Select.view(
                {
                  model: model.project.select,
                  toParentMessage: toProjectMessage,
                  groups: TEAMS,
                  maybeValue: model.project.maybeValue,
                  ariaLabel: 'Project',
                  className: 'w-56',
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Allow custom',
            description: [
              code('allowCustom', h),
              ': the value is a ',
              code('Choice', h),
              ', an option’s value or the typed text. The custom row ends the list; picking it emits ',
              code('ChoseCustom', h),
              ' and opens ',
              code('Select.customInput', h),
              ', which takes focus.',
            ],
            children: [
              Field.view(
                {
                  className: 'w-64',
                  children: [
                    Field.label(
                      { forId: Select.buttonId(model.source.select.id), children: ['How did you hear about us?'] },
                      h,
                    ),
                    customSelect(
                      model.source,
                      toSourceMessage,
                      (text) => Message.ChangedSourceText({ text }),
                      false,
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
        exampleSection(
          {
            title: 'In a field',
            description: [
              'Required: a non-empty check covers the custom row without text; ',
              code('isInvalid', h),
              ' then marks the text field.',
            ],
            children: [
              Field.view(
                {
                  className: 'w-64',
                  isInvalid: isFieldSourceInvalid,
                  children: [
                    Field.label(
                      { forId: Select.buttonId(model.fieldSource.select.id), children: ['How did you hear about us?'] },
                      h,
                    ),
                    customSelect(
                      model.fieldSource,
                      toFieldSourceMessage,
                      (text) => Message.ChangedFieldSourceText({ text }),
                      isFieldSourceInvalid,
                      h,
                    ),
                    ...(isFieldSourceInvalid
                      ? [Field.error({ children: ['Tell us how you heard about us.'] }, h)]
                      : []),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          { title: 'States', description: 'Placeholder, invalid, read-only, disabled.', children: [states(model, h)] },
          h,
        ),
      ],
    },
    h,
  );
});

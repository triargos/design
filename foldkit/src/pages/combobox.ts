import { Array, Option, Record, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Combobox from '../pavo/combobox.ts';
import * as Dialog from '../pavo/dialog.ts';
import * as Field from '../pavo/field.ts';
import type { SelectOption } from '../pavo/select.ts';

export const title = 'Combobox';
export const description = 'A field that filters a list as you type; one value or many.';

const toOptions = (names: ReadonlyArray<string>, toValue: (name: string) => string): ReadonlyArray<SelectOption> =>
  Array.map(names, (name) => ({ value: toValue(name), label: name }));

const lowerCase = (name: string): string => name.toLowerCase();
const slug = (name: string): string => name.toLowerCase().replace(' ', '-');

const PROJECTS = toOptions(['Atlas', 'Beacon', 'Comet', 'Delta', 'Harbor', 'Orbit', 'Pioneer', 'Summit'], lowerCase);
const STATE_PROJECTS = toOptions(['Atlas', 'Beacon', 'Comet', 'Delta'], lowerCase);
const MEMBERS = toOptions(
  ['Maya Chen', 'Jonas Weber', 'Priya Patel', 'Leo Martin', 'Sofia Rossi', 'Noah Kim', 'Emma Larsen', 'Omar Haddad'],
  slug,
);
const SHORT_MEMBERS = Array.take(MEMBERS, 6);
const PAGES = toOptions(
  ['Mobile app', 'Design system', 'Mapping', 'Design', 'App Store listing', 'Designer handoff'],
  (name) => name.toLowerCase().replaceAll(' ', '-'),
);
const DESCRIBED_MEMBERS: ReadonlyArray<SelectOption> = [
  { value: 'maya-chen', label: 'Maya Chen', description: 'Design' },
  { value: 'jonas-weber', label: 'Jonas Weber', description: 'Engineering' },
  { value: 'priya-patel', label: 'Priya Patel', description: 'Finance' },
];
const ROLES = toOptions(['Owner', 'Admin', 'Member', 'Guest'], lowerCase);
const TAGS = toOptions(['Bug', 'Feature', 'Design', 'Docs', 'Performance'], lowerCase);

const FIRST_NAMES = [
  'Ada',
  'Ben',
  'Cara',
  'Dan',
  'Eva',
  'Finn',
  'Gia',
  'Hugo',
  'Ivy',
  'Jack',
  'Kai',
  'Lena',
  'Max',
  'Nina',
  'Oscar',
  'Pia',
  'Quinn',
  'Rosa',
  'Sam',
  'Tara',
  'Uma',
  'Vince',
  'Wren',
  'Xena',
  'Yuri',
  'Zoe',
  'Alex',
  'Bea',
  'Cole',
  'Dina',
  'Eli',
  'Faye',
  'Gus',
  'Hana',
  'Ian',
  'June',
  'Kurt',
  'Lia',
  'Milo',
  'Nora',
  'Otto',
  'Paz',
  'Rex',
  'Sia',
  'Theo',
  'Una',
  'Vera',
  'Will',
  'Yara',
  'Zack',
];
const LAST_NAMES = [
  'Adams',
  'Baker',
  'Carter',
  'Dalton',
  'Ellis',
  'Fischer',
  'Garcia',
  'Hansen',
  'Ito',
  'Jensen',
  'Keller',
  'Lopez',
  'Moreau',
  'Nakamura',
  'Olsen',
  'Park',
  'Quist',
  'Rivera',
  'Silva',
  'Torres',
  'Ueda',
  'Vargas',
  'Walsh',
  'Young',
  'Zimmer',
  'Anderson',
  'Brooks',
  'Costa',
  'Diaz',
  'Evans',
  'Foster',
  'Gray',
  'Hughes',
  'Ivanov',
  'Johnson',
  'Khan',
  'Lambert',
  'Meyer',
  'Novak',
  'Ortiz',
];
const TEAMS = ['Design', 'Engineering', 'Finance', 'Marketing', 'Operations', 'Sales', 'Support', 'Legal'];
const MANY_MEMBER_COUNT = 2000;

const nameAt = (names: ReadonlyArray<string>, index: number): string =>
  Option.getOrElse(Array.get(names, index % names.length), () => '');

const manyMembers: ReadonlyArray<SelectOption> = Array.makeBy(MANY_MEMBER_COUNT, (index) => {
  const round = Math.floor(index / (FIRST_NAMES.length * LAST_NAMES.length));
  const name = `${nameAt(FIRST_NAMES, index)} ${nameAt(LAST_NAMES, Math.floor(index / FIRST_NAMES.length))}`;
  return {
    value: String(index),
    label: round === 0 ? name : `${name} ${round + 1}`,
    description: nameAt(TEAMS, index),
  };
});

const SingleExample = Schema.Struct({ combobox: Combobox.Model, maybeValue: Schema.Option(Schema.String) });
type SingleExample = typeof SingleExample.Type;

const VirtualizedExample = Schema.Struct({
  combobox: Combobox.VirtualizedModel,
  maybeValue: Schema.Option(Schema.String),
});
type VirtualizedExample = typeof VirtualizedExample.Type;

const MultipleExample = Schema.Struct({ combobox: Combobox.Model, values: Schema.Array(Schema.String) });
type MultipleExample = typeof MultipleExample.Type;

const SingleKey = Schema.Literals([
  'default',
  'matching',
  'withDescription',
  'allowCustom',
  'inADialog',
  'statePlaceholder',
  'stateLoading',
  'stateInvalid',
  'stateReadOnly',
  'stateDisabled',
]);
type SingleKey = typeof SingleKey.Type;

const MultipleKey = Schema.Literals(['multiple', 'multipleAllowCustom', 'inAField']);
type MultipleKey = typeof MultipleKey.Type;

export const Model = Schema.Struct({
  singles: Schema.Record(SingleKey, SingleExample),
  multiples: Schema.Record(MultipleKey, MultipleExample),
  virtualized: VirtualizedExample,
  ownerDialog: Dialog.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotSingleMessage: { key: SingleKey, message: Combobox.Message },
  GotMultipleMessage: { key: MultipleKey, message: Combobox.Message },
  GotVirtualizedMessage: { message: Combobox.VirtualizedMessage },
  ClickedRemoveChip: { key: MultipleKey, value: Schema.String },
  ClickedChangeOwner: {},
  GotOwnerDialogMessage: { message: Dialog.Message },
});
export type Message = typeof Message.Type;

const SINGLE_OPTIONS: Readonly<Record<SingleKey, ReadonlyArray<SelectOption>>> = {
  default: PROJECTS,
  matching: PAGES,
  withDescription: DESCRIBED_MEMBERS,
  allowCustom: ROLES,
  inADialog: SHORT_MEMBERS,
  statePlaceholder: STATE_PROJECTS,
  stateLoading: [],
  stateInvalid: STATE_PROJECTS,
  stateReadOnly: STATE_PROJECTS,
  stateDisabled: STATE_PROJECTS,
};

const MULTIPLE_OPTIONS: Readonly<Record<MultipleKey, ReadonlyArray<SelectOption>>> = {
  multiple: MEMBERS,
  multipleAllowCustom: TAGS,
  inAField: SHORT_MEMBERS,
};

const initSingle = (key: SingleKey, maybeValue: Option.Option<string>): SingleExample => ({
  combobox: Combobox.init({
    id: `combobox-${key}`,
    inputValue: Option.match(maybeValue, {
      onNone: () => '',
      onSome: (value) => Combobox.labelOf(SINGLE_OPTIONS[key], value),
    }),
  }),
  maybeValue,
});

const initMultiple = (key: MultipleKey, values: ReadonlyArray<string>): MultipleExample => ({
  combobox: Combobox.initMultiple({ id: `combobox-${key}` }),
  values,
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    singles: {
      default: initSingle('default', Option.some('beacon')),
      matching: initSingle('matching', Option.none()),
      withDescription: initSingle('withDescription', Option.some('jonas-weber')),
      allowCustom: initSingle('allowCustom', Option.some('Contractor')),
      inADialog: initSingle('inADialog', Option.some('maya-chen')),
      statePlaceholder: initSingle('statePlaceholder', Option.none()),
      stateLoading: initSingle('stateLoading', Option.none()),
      stateInvalid: initSingle('stateInvalid', Option.none()),
      stateReadOnly: initSingle('stateReadOnly', Option.some('beacon')),
      stateDisabled: initSingle('stateDisabled', Option.some('beacon')),
    },
    multiples: {
      multiple: initMultiple('multiple', ['maya-chen', 'priya-patel', 'noah-kim']),
      multipleAllowCustom: initMultiple('multipleAllowCustom', ['bug', 'Onboarding']),
      inAField: initMultiple('inAField', []),
    },
    virtualized: {
      combobox: Combobox.initVirtualized({ id: 'combobox-virtualized' }),
      maybeValue: Option.none(),
    },
    ownerDialog: Dialog.init({ id: 'combobox-owner-dialog', isAnimated: true }),
  },
});

const writeSingle = (model: Model, key: SingleKey, next: SingleExample): Model =>
  modifyFields(model, { singles: Record.set(key, next) });

const writeMultiple = (model: Model, key: MultipleKey, next: MultipleExample): Model =>
  modifyFields(model, { multiples: Record.set(key, next) });

const isStaticState = (key: SingleKey): boolean =>
  key === 'stateReadOnly' || key === 'stateDisabled' || key === 'statePlaceholder' || key === 'stateInvalid';

const foldSingle = Update.foldChildAt({
  update: Combobox.update,
  readAt: (model: Model, key: SingleKey) => Option.some(model.singles[key].combobox),
  writeAt: (model: Model, key: SingleKey, nextCombobox: Combobox.Model): Model =>
    writeSingle(model, key, { ...model.singles[key], combobox: nextCombobox }),
  toParentMessage: (key: SingleKey, message: Combobox.Message) => Message.GotSingleMessage({ key, message }),
  foldOutMessage: (key: SingleKey) =>
    Combobox.OutMessage.match<Update.Step<Model, Message>>({
      Selected:
        ({ value }) =>
        (stepModel) => ({
          model: isStaticState(key)
            ? stepModel
            : writeSingle(stepModel, key, { ...stepModel.singles[key], maybeValue: Option.some(value) }),
        }),
      Cleared: () => (stepModel) => ({
        model: writeSingle(stepModel, key, { ...stepModel.singles[key], maybeValue: Option.none() }),
      }),
    }),
});

const foldMultiple = Update.foldChildAt({
  update: Combobox.updateMultiple,
  readAt: (model: Model, key: MultipleKey) => Option.some(model.multiples[key].combobox),
  writeAt: (model: Model, key: MultipleKey, nextCombobox: Combobox.Model): Model =>
    writeMultiple(model, key, { ...model.multiples[key], combobox: nextCombobox }),
  toParentMessage: (key: MultipleKey, message: Combobox.Message) => Message.GotMultipleMessage({ key, message }),
  foldOutMessage: (key: MultipleKey) =>
    Combobox.OutMessage.match<Update.Step<Model, Message>>({
      Selected:
        ({ value }) =>
        (stepModel) => ({
          model: writeMultiple(stepModel, key, {
            ...stepModel.multiples[key],
            values: Combobox.toggledValues(stepModel.multiples[key].values, value),
          }),
        }),
      Cleared: () => (stepModel) => ({ model: stepModel }),
    }),
});

const toVirtualizedMessage = (message: Combobox.VirtualizedMessage): Message =>
  Message.GotVirtualizedMessage({ message });

const writeVirtualized = (model: Model, next: VirtualizedExample): Model =>
  modifyFields(model, { virtualized: () => next });

const foldVirtualized = Update.foldChild({
  update: Combobox.updateVirtualized,
  read: (model: Model) => Option.some(model.virtualized.combobox),
  write: (model: Model, nextCombobox: Combobox.VirtualizedModel) =>
    writeVirtualized(model, { ...model.virtualized, combobox: nextCombobox }),
  toParentMessage: toVirtualizedMessage,
  foldOutMessage: Combobox.OutMessage.match<Update.Step<Model, Message>>({
    Selected:
      ({ value }) =>
      (stepModel) => ({
        model: writeVirtualized(stepModel, { ...stepModel.virtualized, maybeValue: Option.some(value) }),
      }),
    Cleared: () => (stepModel) => ({
      model: writeVirtualized(stepModel, { ...stepModel.virtualized, maybeValue: Option.none() }),
    }),
  }),
});

const toOwnerDialogMessage = (message: Dialog.Message): Message => Message.GotOwnerDialogMessage({ message });

const ownerDialogFold = {
  read: (model: Model) => Option.some(model.ownerDialog),
  write: (model: Model, nextOwnerDialog: Dialog.Model) => modifyFields(model, { ownerDialog: () => nextOwnerDialog }),
  toParentMessage: toOwnerDialogMessage,
  foldOutMessage: Dialog.OutMessage.match<Update.Step<Model, Message>>({
    Opened: () => (stepModel) => ({ model: stepModel }),
    Closed: () => (stepModel) => ({ model: stepModel }),
  }),
};

const foldOwnerDialog = Update.foldChild({ update: Dialog.update, ...ownerDialogFold });
const foldOwnerDialogOpen = Update.foldChildStep({ update: Dialog.open, ...ownerDialogFold });

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotSingleMessage: ({ key, message }) => foldSingle(model, key, message),
    GotMultipleMessage: ({ key, message }) => foldMultiple(model, key, message),
    GotVirtualizedMessage: ({ message }) => foldVirtualized(model, message),
    ClickedRemoveChip: ({ key, value }) => ({
      model: writeMultiple(model, key, {
        ...model.multiples[key],
        values: Array.filter(model.multiples[key].values, (current) => current !== value),
      }),
    }),
    ClickedChangeOwner: () => foldOwnerDialogOpen(model),
    GotOwnerDialogMessage: ({ message }) => foldOwnerDialog(model, message),
  });

type SingleOverrides = Omit<Combobox.ViewConfig<Message>, 'model' | 'toParentMessage' | 'options' | 'maybeValue'>;

const single = (model: Model, key: SingleKey, overrides: SingleOverrides, h: HtmlBuilder<Message>): Html =>
  Combobox.view(
    {
      model: model.singles[key].combobox,
      toParentMessage: (message) => Message.GotSingleMessage({ key, message }),
      options: SINGLE_OPTIONS[key],
      maybeValue: model.singles[key].maybeValue,
      ...overrides,
    },
    h,
  );

type MultipleOverrides = Omit<
  Combobox.MultipleViewConfig<Message>,
  'model' | 'toParentMessage' | 'options' | 'values' | 'onRemove'
>;

const multiple = (model: Model, key: MultipleKey, overrides: MultipleOverrides, h: HtmlBuilder<Message>): Html =>
  Combobox.multiple(
    {
      model: model.multiples[key].combobox,
      toParentMessage: (message) => Message.GotMultipleMessage({ key, message }),
      options: MULTIPLE_OPTIONS[key],
      values: model.multiples[key].values,
      onRemove: (value) => Message.ClickedRemoveChip({ key, value }),
      ...overrides,
    },
    h,
  );

const describedContent =
  (h: HtmlBuilder<Message>): Combobox.ItemContent =>
  ({ label, description: optionDescription }) => [
    h.span([h.Class('truncate')], [label]),
    h.span([h.Class('truncate text-caption text-muted-foreground')], [optionDescription ?? '']),
  ];

const placeholderWhenEmpty = (values: ReadonlyArray<string>, placeholder: string) =>
  Array.isReadonlyArrayEmpty(values) ? { placeholder } : {};

const ownerDialog = (model: Model, h: HtmlBuilder<Message>): Html =>
  Dialog.view(
    {
      model: model.ownerDialog,
      toParentMessage: toOwnerDialogMessage,
      size: 'sm',
      content: (render) => [
        Dialog.header({ children: [Dialog.title({ render: render.title, children: ['Change owner'] }, h)] }, h),
        Dialog.body(
          {
            children: [
              Field.view(
                {
                  children: [
                    Field.label(
                      { forId: Combobox.inputId(model.singles.inADialog.combobox.id), children: ['Owner'] },
                      h,
                    ),
                    single(model, 'inADialog', { placeholder: 'Choose an owner', emptyText: 'No members found' }, h),
                  ],
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
  );

const states = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('grid w-64 gap-2')],
    [
      single(
        model,
        'statePlaceholder',
        { ariaLabel: 'Project', placeholder: 'Choose a project', emptyText: 'No projects found' },
        h,
      ),
      single(
        model,
        'stateLoading',
        { ariaLabel: 'Project, loading', placeholder: 'Choose a project', emptyText: 'Loading projects…' },
        h,
      ),
      single(
        model,
        'stateInvalid',
        {
          ariaLabel: 'Project, invalid',
          placeholder: 'Choose a project',
          isInvalid: true,
          emptyText: 'No projects found',
        },
        h,
      ),
      single(
        model,
        'stateReadOnly',
        { ariaLabel: 'Project, read-only', placeholder: 'Choose a project', isReadOnly: true },
        h,
      ),
      single(
        model,
        'stateDisabled',
        { ariaLabel: 'Project, disabled', placeholder: 'Choose a project', isDisabled: true },
        h,
      ),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html => {
  const reviewers = model.multiples.inAField.values;
  const isReviewersInvalid = Array.isReadonlyArrayEmpty(reviewers);
  return page(
    {
      title,
      description:
        'A field that filters a list as you type, best matches first: Enter picks the first. Values are the options’ value strings. One value with a clear button, many as chips, or text of your own. For a short list without typing, Select.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [
              code('Combobox.view({ options, maybeValue })', h),
              ' on a Combobox Submodel; the parent filters and ranks with ',
              code('Combobox.entries', h),
              '.',
            ],
            children: [
              single(
                model,
                'default',
                {
                  ariaLabel: 'Project',
                  placeholder: 'Choose a project',
                  emptyText: 'No projects found',
                  className: 'w-64',
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Multiple',
            description: [code('Combobox.multiple', h), ': chips, then the input. 32px chips, 4px in.'],
            children: [
              multiple(
                model,
                'multiple',
                {
                  ariaLabel: 'Members',
                  emptyText: 'No members found',
                  className: 'w-80',
                  ...placeholderWhenEmpty(model.multiples.multiple.values, 'Add members'),
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Matching',
            description: [
              'While you type, the exact label leads, then labels that start with the query, then a word that does, then the rest; within each, the more of the label typed, then the order of ',
              code('options', h),
              '. Typing ',
              code('design', h),
              ' lists Design first, though Design system comes earlier in ',
              code('options', h),
              '; Enter picks it. With ',
              code('multiple', h),
              ', what is already selected goes last, so Enter adds, unless you typed half of it or more.',
            ],
            children: [
              single(
                model,
                'matching',
                {
                  ariaLabel: 'Page',
                  placeholder: 'Try “app” or “design”',
                  emptyText: 'No pages found',
                  className: 'w-64',
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With description',
            description: 'A row’s content is yours; the check keeps its column.',
            children: [
              single(
                model,
                'withDescription',
                {
                  ariaLabel: 'Owner',
                  placeholder: 'Choose an owner',
                  emptyText: 'No members found',
                  className: 'w-72',
                  itemContent: describedContent(h),
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
              ': the value is an option’s value or the typed text. While the query names no option, a row takes it, after the options whose label or a word in it starts with the query: Enter picks it unless one does. ',
              code('customLabel', h),
              ' and ',
              code('customOptionLabel', h),
              ' word those rows.',
            ],
            children: [
              Field.view(
                {
                  className: 'w-64',
                  children: [
                    Field.label(
                      { forId: Combobox.inputId(model.singles.allowCustom.combobox.id), children: ['Role'] },
                      h,
                    ),
                    single(
                      model,
                      'allowCustom',
                      { allowCustom: true, placeholder: 'Choose or type a role', emptyText: 'No roles found' },
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
            title: 'Multiple, allow custom',
            description: [
              code('allowCustom', h),
              ' on ',
              code('Combobox.multiple', h),
              ': chips of options and typed text. A typed chip’s value and label are its text; ',
              code('isCustomValue(options, value)', h),
              ' tells it apart.',
            ],
            children: [
              multiple(
                model,
                'multipleAllowCustom',
                {
                  allowCustom: true,
                  ariaLabel: 'Tags',
                  emptyText: 'No tags found',
                  className: 'w-80',
                  ...placeholderWhenEmpty(model.multiples.multipleAllowCustom.values, 'Choose or type tags'),
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Virtualized',
            description: [
              code('Combobox.virtualized', h),
              ': 2,000 members, only the rows in view render. Rows keep to one line.',
            ],
            children: [
              Combobox.virtualized(
                {
                  model: model.virtualized.combobox,
                  toParentMessage: toVirtualizedMessage,
                  options: manyMembers,
                  maybeValue: model.virtualized.maybeValue,
                  ariaLabel: 'Member',
                  placeholder: 'Choose a member',
                  emptyText: 'No members found',
                  className: 'w-80',
                  itemContent: describedContent(h),
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
            description: 'Field, label and error around it.',
            children: [
              Field.view(
                {
                  className: 'w-80',
                  isInvalid: isReviewersInvalid,
                  children: [
                    Field.label(
                      { forId: Combobox.inputId(model.multiples.inAField.combobox.id), children: ['Reviewers'] },
                      h,
                    ),
                    multiple(
                      model,
                      'inAField',
                      {
                        isInvalid: isReviewersInvalid,
                        emptyText: 'No members found',
                        ...placeholderWhenEmpty(reviewers, 'Add reviewers'),
                      },
                      h,
                    ),
                    ...(isReviewersInvalid ? [Field.error({ children: ['Add at least one reviewer.'] }, h)] : []),
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
            title: 'In a dialog',
            description: 'The popup portals into the dialog and keeps focus in it.',
            children: [
              Button.view({ onClick: Message.ClickedChangeOwner(), children: ['Change owner'] }, h),
              ownerDialog(model, h),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'States',
            description: 'Placeholder, loading, invalid, read-only, disabled.',
            children: [states(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  );
});

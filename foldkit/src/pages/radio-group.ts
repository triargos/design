import { Array, Option, Record, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Field from '../pavo/field.ts';
import * as RadioGroup from '../pavo/radio-group.ts';

export const title = 'Radio Group';
export const description = 'One of a few options, all visible.';

const ACCESS = [
  { value: 'members', label: 'All members' },
  { value: 'team', label: 'Project team only' },
  { value: 'private', label: 'Only me' },
];

const DIGESTS = [
  { value: 'daily', label: 'Daily', description: 'One email in the morning with everything from the day before.' },
  { value: 'instant', label: 'Instantly', description: 'Each update on its own, as it happens.' },
  { value: 'never', label: 'Never', description: 'Updates stay in the inbox, no email.' },
];

const PLANS = ['Free', 'Team', 'Business', 'Enterprise'];

const DISABLED_ACCESS = [
  { value: 'members', label: 'All members' },
  { value: 'private', label: 'Only me' },
];

const GroupId = Schema.Literals(['Access', 'Digest', 'Plan', 'InvalidPlan', 'Disabled']);
type GroupId = typeof GroupId.Type;

export const Model = Schema.Struct({
  radioGroups: Schema.Record(GroupId, RadioGroup.Model),
  selections: Schema.Record(GroupId, Schema.Option(Schema.String)),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotRadioGroupMessage: { groupId: GroupId, message: RadioGroup.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    radioGroups: {
      Access: RadioGroup.init({ id: 'radio-group-access' }),
      Digest: RadioGroup.init({ id: 'radio-group-digest' }),
      Plan: RadioGroup.init({ id: 'radio-group-plan' }),
      InvalidPlan: RadioGroup.init({ id: 'radio-group-invalid-plan' }),
      Disabled: RadioGroup.init({ id: 'radio-group-disabled' }),
    },
    selections: {
      Access: Option.some('members'),
      Digest: Option.some('daily'),
      Plan: Option.some('Team'),
      InvalidPlan: Option.none(),
      Disabled: Option.some('members'),
    },
  },
});

const toRadioGroupMessage =
  (groupId: GroupId) =>
  (message: RadioGroup.Message): Message =>
    Message.GotRadioGroupMessage({ groupId, message });

const foldRadioGroupOutMessage = (groupId: GroupId) =>
  RadioGroup.OutMessage.match<Update.Step<Model, Message>>({
    Selected:
      ({ value }) =>
      (stepModel) => ({
        model: modifyFields(stepModel, {
          selections: Record.set(groupId, Option.some(value)),
        }),
      }),
  });

const foldRadioGroup = Update.foldChildAt({
  update: RadioGroup.update,
  readAt: (model: Model, groupId: GroupId) => Option.some(model.radioGroups[groupId]),
  writeAt: (model: Model, groupId: GroupId, nextRadioGroup: RadioGroup.Model) =>
    modifyFields(model, { radioGroups: Record.set(groupId, nextRadioGroup) }),
  toParentMessage: (groupId: GroupId, message: RadioGroup.Message) => toRadioGroupMessage(groupId)(message),
  foldOutMessage: (groupId: GroupId) => foldRadioGroupOutMessage(groupId),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotRadioGroupMessage: ({ groupId, message }) => foldRadioGroup(model, groupId, message),
  });

type GroupConfig = Omit<RadioGroup.ViewConfig<Message>, 'model' | 'toParentMessage' | 'selectedValue'>;

const radioGroup = (model: Model, groupId: GroupId, config: GroupConfig, h: HtmlBuilder<Message>): Html =>
  RadioGroup.view(
    {
      model: model.radioGroups[groupId],
      toParentMessage: toRadioGroupMessage(groupId),
      selectedValue: model.selections[groupId],
      ...config,
    },
    h,
  );

const labelOf = (options: ReadonlyArray<{ value: string; label: string }>, value: string): string =>
  Array.findFirst(options, (option) => option.value === value).pipe(
    Option.map(({ label }) => label),
    Option.getOrElse(() => value),
  );

const radioDefault = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.fieldSet(
    {
      className: 'max-w-md',
      children: [
        Field.legend({ children: ['Who can see this project'] }, h),
        radioGroup(
          model,
          'Access',
          {
            options: Array.map(ACCESS, ({ value }) => value),
            ariaLabel: 'Who can see this project',
            optionView: ({ value, radio, label }) =>
              Field.view(
                {
                  orientation: 'horizontal',
                  attributes: [h.Key(value)],
                  children: [
                    radio,
                    Field.label({ attributes: label, className: 'font-normal', children: [labelOf(ACCESS, value)] }, h),
                  ],
                },
                h,
              ),
          },
          h,
        ),
      ],
    },
    h,
  );

const withDescription = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.fieldSet(
    {
      className: 'max-w-md',
      children: [
        Field.legend({ children: ['Email updates'] }, h),
        radioGroup(
          model,
          'Digest',
          {
            options: Array.map(DIGESTS, ({ value }) => value),
            ariaLabel: 'Email updates',
            hasOptionDescription: true,
            optionView: ({ value, index, radio, label, description }) =>
              Field.view(
                {
                  orientation: 'horizontal',
                  attributes: [h.Key(value)],
                  children: [
                    radio,
                    Field.content(
                      {
                        children: [
                          Field.label({ attributes: label, children: [labelOf(DIGESTS, value)] }, h),
                          Field.description(
                            {
                              attributes: description,
                              children: Array.get(DIGESTS, index).pipe(
                                Option.map((digest) => [digest.description]),
                                Option.getOrElse(() => []),
                              ),
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
          },
          h,
        ),
      ],
    },
    h,
  );

const choiceCards = (model: Model, groupId: GroupId, isInvalid: boolean, h: HtmlBuilder<Message>): Html =>
  radioGroup(
    model,
    groupId,
    {
      options: PLANS,
      ariaLabel: 'Plan',
      isInvalid,
      className: groupId === 'Plan' ? 'max-w-md sm:grid-cols-2' : 'sm:grid-cols-2',
      optionView: (option) =>
        RadioGroup.choiceCard({ option, isInvalid, children: [option.value], attributes: [h.Key(option.value)] }, h),
    },
    h,
  );

const invalid = (model: Model, h: HtmlBuilder<Message>): Html => {
  const isInvalid = Option.isNone(model.selections.InvalidPlan);
  return Field.view(
    {
      isInvalid,
      className: 'max-w-md',
      children: [
        choiceCards(model, 'InvalidPlan', isInvalid, h),
        ...(isInvalid ? [Field.error({ children: ['Choose a plan.'] }, h)] : []),
      ],
    },
    h,
  );
};

const disabled = (model: Model, h: HtmlBuilder<Message>): Html =>
  radioGroup(
    model,
    'Disabled',
    {
      options: Array.map(DISABLED_ACCESS, ({ value }) => value),
      ariaLabel: 'Who can see this project',
      isDisabled: true,
      optionView: ({ value, radio, label }) =>
        Field.view(
          {
            orientation: 'horizontal',
            isDisabled: true,
            attributes: [h.Key(value)],
            children: [
              radio,
              Field.label(
                { attributes: label, className: 'font-normal', children: [labelOf(DISABLED_ACCESS, value)] },
                h,
              ),
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
        'One of a few options, all visible. RadioGroup.view draws the dot next to a label; RadioGroup.choiceCard is the radio as a card.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('Field.fieldSet · Field.legend', h)],
            children: [radioDefault(model, h)],
          },
          h,
        ),
        exampleSection({ title: 'With description', children: [withDescription(model, h)] }, h),
        exampleSection(
          {
            title: 'Choice card',
            description: [
              code('RadioGroup.choiceCard', h),
              ': the radio as a card, for a few choices that deserve room.',
            ],
            children: [choiceCards(model, 'Plan', false, h)],
          },
          h,
        ),
        exampleSection(
          { title: 'Invalid', description: 'Not chosen yet, submitted.', children: [invalid(model, h)] },
          h,
        ),
        exampleSection({ title: 'Disabled', children: [disabled(model, h)] }, h),
      ],
    },
    h,
  ),
);

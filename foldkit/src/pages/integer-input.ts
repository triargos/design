import { Option, Record, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as IntegerInput from '../pavo/integer-input.ts';

export const title = 'Integer Input';
export const description = 'A whole number with steppers and a unit.';

const INTEGER_INPUTS: ReadonlyArray<IntegerInput.InitConfig> = [
  { id: 'integer-input-days', value: 30 },
  { id: 'integer-input-seats', value: 8, max: 10 },
  { id: 'integer-input-disabled', value: 30 },
];

export const Model = Schema.Struct({
  integerInputs: Schema.Record(Schema.String, IntegerInput.Model),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotIntegerInputMessage: { inputId: Schema.String, message: IntegerInput.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    integerInputs: Record.fromIterableWith(INTEGER_INPUTS, (config) => [config.id, IntegerInput.init(config)]),
  },
});

const toIntegerInputMessage =
  (inputId: string) =>
  (message: IntegerInput.Message): Message =>
    Message.GotIntegerInputMessage({ inputId, message });

const foldIntegerInputOutMessage = () =>
  IntegerInput.OutMessage.match<Update.Step<Model, Message>>({
    ChangedValue: () => (stepModel) => ({ model: stepModel }),
  });

const foldIntegerInput = Update.foldChildAt({
  update: IntegerInput.update,
  readAt: (model: Model, inputId: string) => Record.get(model.integerInputs, inputId),
  writeAt: (model: Model, inputId: string, nextIntegerInput: IntegerInput.Model) =>
    modifyFields(model, { integerInputs: Record.set(inputId, nextIntegerInput) }),
  toParentMessage: (inputId: string, message: IntegerInput.Message) => toIntegerInputMessage(inputId)(message),
  foldOutMessage: foldIntegerInputOutMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotIntegerInputMessage: ({ inputId, message }) => foldIntegerInput(model, inputId, message),
  });

type IntegerInputConfig = Omit<IntegerInput.ViewConfig<Message>, 'model' | 'toParentMessage'>;

const integerInput = (model: Model, inputId: string, config: IntegerInputConfig, h: HtmlBuilder<Message>): Html =>
  Option.match(Record.get(model.integerInputs, inputId), {
    onNone: () => null,
    onSome: (inputModel) =>
      IntegerInput.view({ model: inputModel, toParentMessage: toIntegerInputMessage(inputId), ...config }, h),
  });

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description: 'A whole number between a minus and a plus, with a unit.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description:
              'Steps roll the digits; hold a stepper to repeat. Focus selects the number, so the first key replaces it.',
            children: [integerInput(model, 'integer-input-days', { unit: 'days', ariaLabel: 'Payment terms' }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With max',
            description: [
              code('max', h),
              ' stops the stepper and clamps typed values; the minimum is always 0. A press past a limit shakes the number.',
            ],
            children: [integerInput(model, 'integer-input-seats', { unit: 'seats', ariaLabel: 'Seats' }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Disabled',
            children: [
              integerInput(
                model,
                'integer-input-disabled',
                { unit: 'days', ariaLabel: 'Payment terms', isDisabled: true },
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
);

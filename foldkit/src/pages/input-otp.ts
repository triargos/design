import { Duration, Effect, Option, Record, Schema } from 'effect';
import { Command, Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Field from '../pavo/field.ts';
import * as InputOtp from '../pavo/input-otp.ts';

export const title = 'Input OTP';
export const description = 'A one-time code, one input per character.';

const CORRECT_CODE = '123456';
const CODE_LENGTH = 6;
const PIN_LENGTH = 4;
const CODE_GROUPS = [3, 3];
const VERIFY_LATENCY = Duration.millis(700);

const VerifyStatus = Schema.Literals(['Idle', 'Verifying', 'Verified']);

export const Model = Schema.Struct({
  codeInputs: Schema.Record(Schema.String, InputOtp.Model),
  verifyInput: InputOtp.Model,
  verifyStatus: VerifyStatus,
  maybeVerifyError: Schema.Option(Schema.String),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotCodeInputMessage: { inputId: Schema.String, message: InputOtp.Message },
  GotVerifyInputMessage: { message: InputOtp.Message },
  SubmittedVerifyForm: {},
  CompletedVerifyCode: {},
});
export type Message = typeof Message.Type;

const VerifyCode = Command.define('VerifyCode', {
  messages: [Message.CompletedVerifyCode],
  execute: Effect.sleep(VERIFY_LATENCY).pipe(Effect.as(Message.CompletedVerifyCode())),
});

const CODE_INPUTS: ReadonlyArray<InputOtp.InitConfig> = [
  { id: 'otp-default', length: CODE_LENGTH },
  { id: 'otp-pin', length: PIN_LENGTH },
  { id: 'otp-incomplete', length: CODE_LENGTH, value: '481' },
  { id: 'otp-wrong', length: CODE_LENGTH, value: '481920' },
  { id: 'otp-verifying', length: CODE_LENGTH, value: '481920' },
  { id: 'otp-disabled', length: CODE_LENGTH, value: '481' },
];

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    codeInputs: Record.fromIterableWith(CODE_INPUTS, (config) => [config.id, InputOtp.init(config)]),
    verifyInput: InputOtp.init({ id: 'otp-verify', length: CODE_LENGTH }),
    verifyStatus: 'Idle',
    maybeVerifyError: Option.none(),
  },
});

const toCodeInputMessage =
  (inputId: string) =>
  (message: InputOtp.Message): Message =>
    Message.GotCodeInputMessage({ inputId, message });

const toVerifyInputMessage = (message: InputOtp.Message): Message => Message.GotVerifyInputMessage({ message });

const foldCodeInputOutMessage = () =>
  InputOtp.OutMessage.match<Update.Step<Model, Message>>({
    ChangedValue: () => (stepModel) => ({ model: stepModel }),
  });

const foldCodeInput = Update.foldChildAt({
  update: InputOtp.update,
  readAt: (model: Model, inputId: string) => Record.get(model.codeInputs, inputId),
  writeAt: (model: Model, inputId: string, nextCodeInput: InputOtp.Model) =>
    modifyFields(model, { codeInputs: Record.set(inputId, nextCodeInput) }),
  toParentMessage: (inputId: string, message: InputOtp.Message) => toCodeInputMessage(inputId)(message),
  foldOutMessage: foldCodeInputOutMessage,
});

const startVerify = (model: Model): Update.Return<Model, Message> => ({
  model: modifyFields(model, { verifyStatus: () => 'Verifying', maybeVerifyError: () => Option.none() }),
  commands: [VerifyCode()],
});

const foldVerifyInputOutMessage = InputOtp.OutMessage.match<Update.Step<Model, Message>>({
  ChangedValue:
    ({ isComplete }) =>
    (stepModel) => {
      const clearedModel = modifyFields(stepModel, { maybeVerifyError: () => Option.none() });
      return isComplete && stepModel.verifyStatus === 'Idle' ? startVerify(clearedModel) : { model: clearedModel };
    },
});

const verifyInputFold = {
  read: (model: Model) => Option.some(model.verifyInput),
  write: (model: Model, nextVerifyInput: InputOtp.Model) => modifyFields(model, { verifyInput: () => nextVerifyInput }),
  toParentMessage: toVerifyInputMessage,
};

const foldVerifyInput = Update.foldChild({
  update: InputOtp.update,
  ...verifyInputFold,
  foldOutMessage: foldVerifyInputOutMessage,
});
const foldVerifyInputReset = Update.foldChildStep({ update: InputOtp.reset, ...verifyInputFold });
const foldVerifyInputFocus = Update.foldChildStep({ update: InputOtp.focus, ...verifyInputFold });

const withVerifyError =
  (error: string): Update.Step<Model, Message> =>
  (stepModel) => ({
    model: modifyFields(stepModel, { maybeVerifyError: () => Option.some(error) }),
  });

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotCodeInputMessage: ({ inputId, message }) => foldCodeInput(model, inputId, message),
    GotVerifyInputMessage: ({ message }) => foldVerifyInput(model, message),
    SubmittedVerifyForm: () => {
      if (model.verifyStatus !== 'Idle') {
        return { model };
      } else if (model.verifyInput.value.length < CODE_LENGTH) {
        return Update.combine(model, [withVerifyError('Enter all 6 digits.'), foldVerifyInputFocus]);
      } else {
        return startVerify(model);
      }
    },
    CompletedVerifyCode: () => {
      if (model.verifyInput.value === CORRECT_CODE) {
        return { model: modifyFields(model, { verifyStatus: () => 'Verified' }) };
      } else {
        return Update.combine(model, [
          (stepModel: Model) => ({ model: modifyFields(stepModel, { verifyStatus: () => 'Idle' }) }),
          withVerifyError('That code didn’t work.'),
          foldVerifyInputReset,
        ]);
      }
    },
  });

type CodeInputConfig = Omit<InputOtp.ViewConfig<Message>, 'model' | 'toParentMessage'>;

const codeInput = (model: Model, inputId: string, config: CodeInputConfig, h: HtmlBuilder<Message>): Html =>
  Option.match(Record.get(model.codeInputs, inputId), {
    onNone: () => null,
    onSome: (inputModel) =>
      InputOtp.view({ model: inputModel, toParentMessage: toCodeInputMessage(inputId), ...config }, h),
  });

const codeField = (
  model: Model,
  inputId: string,
  label: string,
  config: CodeInputConfig & Readonly<{ error?: string }>,
  h: HtmlBuilder<Message>,
): Html => {
  const { error, ...inputConfig } = config;
  return Field.view(
    {
      isInvalid: error !== undefined,
      isDisabled: inputConfig.isDisabled === true,
      className: 'w-fit min-w-0',
      children: [
        Field.label({ forId: inputId, children: [label] }, h),
        codeInput(model, inputId, inputConfig, h),
        ...(error === undefined ? [] : [Field.error({ children: [error] }, h)]),
      ],
    },
    h,
  );
};

const otpDefault = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      className: 'w-fit min-w-0',
      children: [
        Field.label({ forId: 'otp-default', children: ['Authentication code'] }, h),
        codeInput(model, 'otp-default', { groups: CODE_GROUPS }, h),
        Field.description({ children: ['Enter the 6-digit code from your authenticator app.'] }, h),
      ],
    },
    h,
  );

const verify = (model: Model, h: HtmlBuilder<Message>): Html => {
  const isInvalid = Option.isSome(model.maybeVerifyError);
  return h.form(
    [h.OnSubmit(Message.SubmittedVerifyForm()), h.Class('flex w-fit min-w-0 flex-col gap-group')],
    [
      Field.view(
        {
          isInvalid,
          children: [
            Field.label({ forId: 'otp-verify', children: ['Authentication code'] }, h),
            InputOtp.view(
              {
                model: model.verifyInput,
                toParentMessage: toVerifyInputMessage,
                groups: CODE_GROUPS,
                isReadOnly: model.verifyStatus !== 'Idle',
                isInvalid,
              },
              h,
            ),
            Option.match(model.maybeVerifyError, {
              onNone: () =>
                Field.description(
                  { children: [model.verifyStatus === 'Verified' ? 'Verified.' : `Try ${CORRECT_CODE}.`] },
                  h,
                ),
              onSome: (error) => Field.error({ children: [error] }, h),
            }),
          ],
        },
        h,
      ),
      Button.view(
        { intent: 'primary', type: 'submit', isPending: model.verifyStatus === 'Verifying', children: ['Verify'] },
        h,
      ),
    ],
  );
};

const states = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('grid gap-group')],
    [
      codeField(
        model,
        'otp-incomplete',
        'Incomplete',
        { groups: CODE_GROUPS, isInvalid: true, error: 'Enter all 6 digits.' },
        h,
      ),
      codeField(
        model,
        'otp-wrong',
        'Wrong code',
        { groups: CODE_GROUPS, isInvalid: true, error: 'That code didn’t work.' },
        h,
      ),
      codeField(model, 'otp-verifying', 'Verifying', { groups: CODE_GROUPS, isReadOnly: true }, h),
      codeField(model, 'otp-disabled', 'Disabled', { groups: CODE_GROUPS, isDisabled: true }, h),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description: 'A one-time code, one input per character. Typing, paste and autofill advance the focus.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'Six digits in two groups of three, as authenticator apps print them.',
            children: [otpDefault(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Four digits',
            description: '`mask` hides the digits, for a PIN.',
            children: [codeField(model, 'otp-pin', 'PIN', { isMasked: true }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Verify',
            description:
              'The sixth digit submits. A wrong code shakes the row, clears it and focuses the first slot; a letter shakes its slot.',
            children: [verify(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'States',
            description: 'Incomplete turns only the empty slots; a wrong code turns all of them.',
            children: [states(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

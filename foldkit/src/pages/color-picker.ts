import { Option, Schema } from 'effect';
import { Submodel, Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import { cn } from '../pavo/cn.ts';
import * as ColorPicker from '../pavo/color-picker.ts';
import * as Field from '../pavo/field.ts';

export const title = 'Color Picker';
export const description = 'A color chosen from swatches, or any color.';

const TEAM_COLORS: ReadonlyArray<ColorPicker.ColorPreset> = [
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#a855f7', label: 'Purple' },
];

const PickerKey = Schema.Literals(['default', 'custom', 'presets', 'inline', 'inAField']);
type PickerKey = typeof PickerKey.Type;

const Picker = Schema.Struct({ picker: ColorPicker.Model, value: Schema.String });
type Picker = typeof Picker.Type;

export const Model = Schema.Struct({ pickers: Schema.Record(PickerKey, Picker) });
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotPickerMessage: { key: PickerKey, message: ColorPicker.Message },
});
export type Message = typeof Message.Type;

const initPicker = (key: PickerKey, value: string): Picker => ({
  picker: ColorPicker.init({ id: `color-picker-${key}`, value }),
  value,
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    pickers: {
      default: initPicker('default', '#22c55e'),
      custom: initPicker('custom', '#d3d3d3'),
      presets: initPicker('presets', '#10b981'),
      inline: initPicker('inline', '#8b5cf6'),
      inAField: initPicker('inAField', '#22c55e'),
    },
  },
});

const writePicker = (model: Model, key: PickerKey, nextPicker: Picker): Model =>
  modifyFields(model, { pickers: (pickers) => ({ ...pickers, [key]: nextPicker }) });

const toPickerMessage =
  (key: PickerKey) =>
  (message: ColorPicker.Message): Message =>
    Message.GotPickerMessage({ key, message });

const foldPicker = Update.foldChildAt({
  update: ColorPicker.update,
  readAt: (model: Model, key: PickerKey) => Option.some(model.pickers[key].picker),
  writeAt: (model: Model, key: PickerKey, nextPicker: ColorPicker.Model): Model =>
    writePicker(model, key, { ...model.pickers[key], picker: nextPicker }),
  toParentMessage: (key: PickerKey, message: ColorPicker.Message) => toPickerMessage(key)(message),
  foldOutMessage: (key: PickerKey) =>
    ColorPicker.OutMessage.match<Update.Step<Model, Message>>({
      ChangedColor:
        ({ value }) =>
        (stepModel) => ({ model: writePicker(stepModel, key, { ...stepModel.pickers[key], value }) }),
    }),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotPickerMessage: ({ key, message }) => foldPicker(model, key, message),
  });

const liftPicker = (key: PickerKey) => ({
  read: (model: Model) => Option.some(model.pickers[key].picker),
  toParentMessage: toPickerMessage(key),
});

export const subscriptions = {
  ...Subscription.lift({ colorPickerDefaultDrag: ColorPicker.subscriptions.dragPointer })<Model, Message>(
    liftPicker('default'),
  ),
  ...Subscription.lift({ colorPickerCustomDrag: ColorPicker.subscriptions.dragPointer })<Model, Message>(
    liftPicker('custom'),
  ),
  ...Subscription.lift({ colorPickerInlineDrag: ColorPicker.subscriptions.dragPointer })<Model, Message>(
    liftPicker('inline'),
  ),
  ...Subscription.lift({ colorPickerInAFieldDrag: ColorPicker.subscriptions.dragPointer })<Model, Message>(
    liftPicker('inAField'),
  ),
};

type PickerOverrides = Omit<ColorPicker.ViewConfig<Message>, 'model' | 'toParentMessage' | 'value'>;

const picker = (model: Model, key: PickerKey, overrides: PickerOverrides, h: HtmlBuilder<Message>): Html =>
  ColorPicker.view(
    {
      model: model.pickers[key].picker,
      toParentMessage: toPickerMessage(key),
      value: model.pickers[key].value,
      ...overrides,
    },
    h,
  );

const PROJECT_COLOR_LABEL_ID = 'color-picker-project-color';

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A color chosen from swatches, or any color: for data colors such as a project or label color, not theme tokens. The UI around them stays on the intents. Default swatches: twelve Tailwind 500s, which read as a dot and as an icon stroke.',
      sections: [
        exampleSection({ title: 'Default', description: 'A preset.', children: [picker(model, 'default', {}, h)] }, h),
        exampleSection(
          {
            title: 'Custom',
            description: 'Any other hex shows as the custom swatch.',
            children: [picker(model, 'custom', {}, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Presets',
            description: [
              code('presets', h),
              ': your own swatches; ',
              code("custom: 'None'", h),
              ' keeps the choice to them.',
            ],
            children: [picker(model, 'presets', { presets: TEAM_COLORS, custom: 'None', ariaLabel: 'Team color' }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Inline',
            description: [code("custom: 'Inline'", h), ': the custom picker in place, inside a popup.'],
            children: [
              h.div(
                [h.Class(cn('rounded-popup bg-popover text-popover-foreground shadow-popup', 'w-fit p-3'))],
                [picker(model, 'inline', { custom: 'Inline' }, h)],
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'In a field',
            description: [code('Field.title', h), ' + ', code('ariaLabelledBy', h)],
            children: [
              Field.view(
                {
                  className: 'w-80',
                  children: [
                    Field.title({ attributes: [h.Id(PROJECT_COLOR_LABEL_ID)], children: ['Project color'] }, h),
                    picker(model, 'inAField', { ariaLabelledBy: PROJECT_COLOR_LABEL_ID }, h),
                    Field.description({ children: ['Shows as a dot next to the project name.'] }, h),
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
  ),
);

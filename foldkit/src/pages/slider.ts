import { Option, Schema } from 'effect';
import { Submodel, Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Field from '../pavo/field.ts';
import * as Slider from '../pavo/slider.ts';

export const title = 'Slider';
export const description = 'A value on a continuous range.';

const ZOOM_LABEL_ID = 'slider-zoom-label';

const SliderId = Schema.Literals(['Volume', 'BudgetMin', 'BudgetMax', 'Zoom', 'Disabled']);
type SliderId = typeof SliderId.Type;

const SliderEntry = Schema.Struct({ slider: Slider.Model, value: Schema.Number });

export const Model = Schema.Struct({
  sliders: Schema.Record(SliderId, SliderEntry),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotSliderMessage: { sliderId: SliderId, message: Slider.Message },
});
export type Message = typeof Message.Type;

const percentSlider = (id: string, value: number) => ({
  slider: Slider.init({ id, min: 0, max: 100, step: 1 }),
  value,
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    sliders: {
      Volume: percentSlider('slider-volume', 40),
      BudgetMin: percentSlider('slider-budget-min', 20),
      BudgetMax: percentSlider('slider-budget-max', 70),
      Zoom: { slider: Slider.init({ id: 'slider-zoom', min: 100, max: 300, step: 10 }), value: 140 },
      Disabled: percentSlider('slider-disabled', 60),
    },
  },
});

const toSliderMessage =
  (sliderId: SliderId) =>
  (message: Slider.Message): Message =>
    Message.GotSliderMessage({ sliderId, message });

const writeEntry = (
  model: Model,
  sliderId: SliderId,
  toNextEntry: (entry: typeof SliderEntry.Type) => typeof SliderEntry.Type,
): Model => modifyFields(model, { sliders: (sliders) => ({ ...sliders, [sliderId]: toNextEntry(sliders[sliderId]) }) });

const foldSliderOutMessage = (sliderId: SliderId) =>
  Slider.OutMessage.match<Update.Step<Model, Message>>({
    ChangedValue:
      ({ value }) =>
      (stepModel) => ({ model: writeEntry(stepModel, sliderId, (entry) => ({ ...entry, value })) }),
  });

const foldSlider = Update.foldChildAt({
  update: Slider.update,
  readAt: (model: Model, sliderId: SliderId) => Option.some(model.sliders[sliderId].slider),
  writeAt: (model: Model, sliderId: SliderId, nextSlider: Slider.Model) =>
    writeEntry(model, sliderId, (entry) => ({ ...entry, slider: nextSlider })),
  toParentMessage: (sliderId: SliderId, message: Slider.Message) => toSliderMessage(sliderId)(message),
  foldOutMessage: (sliderId: SliderId) => foldSliderOutMessage(sliderId),
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotSliderMessage: ({ sliderId, message }) => foldSlider(model, sliderId, message),
  });

const liftSlider = (sliderId: SliderId) => ({
  read: (model: Model) => Option.some(model.sliders[sliderId].slider),
  toParentMessage: toSliderMessage(sliderId),
});

export const subscriptions = {
  ...Subscription.lift({
    sliderVolumePointer: Slider.subscriptions.dragPointer,
    sliderVolumeEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>(liftSlider('Volume')),
  ...Subscription.lift({
    sliderBudgetMinPointer: Slider.subscriptions.dragPointer,
    sliderBudgetMinEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>(liftSlider('BudgetMin')),
  ...Subscription.lift({
    sliderBudgetMaxPointer: Slider.subscriptions.dragPointer,
    sliderBudgetMaxEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>(liftSlider('BudgetMax')),
  ...Subscription.lift({
    sliderZoomPointer: Slider.subscriptions.dragPointer,
    sliderZoomEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>(liftSlider('Zoom')),
};

type SliderConfig = Omit<Slider.ViewConfig<Message>, 'model' | 'toParentMessage' | 'value'>;

const slider = (model: Model, sliderId: SliderId, config: SliderConfig, h: HtmlBuilder<Message>): Html =>
  Slider.view(
    {
      model: model.sliders[sliderId].slider,
      toParentMessage: toSliderMessage(sliderId),
      value: model.sliders[sliderId].value,
      ...config,
    },
    h,
  );

const range = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-72 flex-col gap-group')],
    [
      slider(model, 'BudgetMin', { ariaLabel: 'Budget minimum' }, h),
      slider(model, 'BudgetMax', { ariaLabel: 'Budget maximum' }, h),
    ],
  );

const withLabelAndValue = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      className: 'w-full max-w-80',
      children: [
        h.div(
          [h.Class('flex items-baseline justify-between')],
          [
            Field.label({ attributes: [h.Id(ZOOM_LABEL_ID)], children: ['Zoom'] }, h),
            h.span([h.Class('text-caption text-muted-foreground tabular-nums')], [`${model.sliders.Zoom.value}%`]),
          ],
        ),
        slider(model, 'Zoom', { ariaLabelledBy: ZOOM_LABEL_ID, formatValue: (value) => `${value}%` }, h),
        Field.description({ children: ['Crop your profile photo.'] }, h),
      ],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A value on a continuous range, where the feel matters more than the exact number: zoom, volume. Name it with ariaLabel or a Field.label id; each thumb takes the name.',
      sections: [
        exampleSection(
          { title: 'Default', children: [slider(model, 'Volume', { ariaLabel: 'Volume', className: 'w-72' }, h)] },
          h,
        ),
        exampleSection(
          {
            title: 'Range',
            description: [code('[20, 70]', h), ': @foldkit/ui Slider has one thumb, so a range is two sliders here.'],
            children: [range(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With label and value',
            description: 'The field shows the controlled value beside the label.',
            children: [withLabelAndValue(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Disabled',
            description: 'Dims the whole control: the one place opacity stays.',
            children: [slider(model, 'Disabled', { ariaLabel: 'Volume', isDisabled: true, className: 'w-72' }, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

import { Popover as PopoverPrimitive, RadioGroup as RadioGroupPrimitive } from '@foldkit/ui';
import { Array, Effect, Match, Number, Option, Schema, Stream, pipe } from 'effect';
import { Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { cn } from './cn.ts';
import * as InputGroup from './input-group.ts';
import * as Popover from './popover.ts';

export type ColorPreset = Readonly<{ value: string; label: string }>;

export const DEFAULT_PRESETS: ReadonlyArray<ColorPreset> = [
  { value: '#6b7280', label: 'Gray' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
];

export const DEFAULT_LABEL = 'Color';
export const DEFAULT_CUSTOM_LABEL = 'Custom color';
export const DEFAULT_HEX_LABEL = 'Hex color';

const CUSTOM_GRADIENT = 'conic-gradient(#ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)';
const HUE_GRADIENT = 'linear-gradient(90deg, red 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, red)';
const SATURATION_GRADIENT =
  'linear-gradient(0deg, #000, transparent), linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))';

export const Hsv = Schema.Struct({ hue: Schema.Number, saturation: Schema.Number, brightness: Schema.Number });
export type Hsv = typeof Hsv.Type;

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const MAX_HUE = 360;
const MAX_PERCENT = 100;
const MAX_CHANNEL = 255;
const HUE_SECTOR = 60;
const HEX_RADIX = 16;

const expandedHex = (hex: string): string => {
  const digits = hex.replace('#', '');
  return digits.length === 3
    ? pipe(
        digits.split(''),
        Array.map((digit) => `${digit}${digit}`),
        Array.join(''),
      )
    : digits;
};

const channel = (digits: string, index: number): number =>
  globalThis.Number.parseInt(digits.slice(index * 2, index * 2 + 2), HEX_RADIX);

export const hexToHsv = (hex: string): Hsv => {
  const digits = expandedHex(hex);
  const [red, green, blue] = [channel(digits, 0), channel(digits, 1), channel(digits, 2)];
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);
  const hueSector = Match.value(max).pipe(
    Match.withReturnType<number>(),
    Match.when(
      () => delta === 0,
      () => 0,
    ),
    Match.when(red, () => (green - blue) / delta),
    Match.when(green, () => 2 + (blue - red) / delta),
    Match.orElse(() => 4 + (red - green) / delta),
  );
  return {
    hue: (HUE_SECTOR * (hueSector < 0 ? hueSector + 6 : hueSector)) % MAX_HUE,
    saturation: max === 0 ? 0 : (delta / max) * MAX_PERCENT,
    brightness: (max / MAX_CHANNEL) * MAX_PERCENT,
  };
};

const toHexPair = (value: number): string => Math.round(value).toString(HEX_RADIX).padStart(2, '0');

export const hsvToHex = ({ hue, saturation, brightness }: Hsv): string => {
  const scaledSaturation = saturation / MAX_PERCENT;
  const scaledBrightness = (brightness / MAX_PERCENT) * MAX_CHANNEL;
  const sector = (hue / HUE_SECTOR) % 6;
  const component = (offset: number): number => {
    const position = (offset + sector) % 6;
    return scaledBrightness - scaledBrightness * scaledSaturation * Math.max(0, Math.min(position, 4 - position, 1));
  };
  return `#${toHexPair(component(5))}${toHexPair(component(3))}${toHexPair(component(1))}`;
};

const hueColor = (hue: number): string => `hsl(${hue}, 100%, 50%)`;

export const isHex = (text: string): boolean => HEX.test(text);

const normalizedHex = (text: string): string => `#${expandedHex(text).toLowerCase()}`;

export const DragTarget = Schema.Literals(['Area', 'Hue']);
export type DragTarget = typeof DragTarget.Type;

export const Model = Schema.Struct({
  id: Schema.String,
  hsv: Hsv,
  maybeDragTarget: Schema.Option(DragTarget),
  maybeHexDraft: Schema.Option(Schema.String),
  swatches: RadioGroupPrimitive.Model,
  popover: PopoverPrimitive.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotSwatchesMessage: { message: RadioGroupPrimitive.Message },
  GotPopoverMessage: { message: PopoverPrimitive.Message },
  PressedArea: { saturation: Schema.Number, brightness: Schema.Number },
  PressedHue: { hue: Schema.Number },
  MovedDragPointer: { horizontal: Schema.Number, vertical: Schema.Number },
  ReleasedDragPointer: {},
  PressedAreaKey: { key: Schema.String },
  PressedHueKey: { key: Schema.String },
  ChangedHexText: { text: Schema.String },
  BlurredHexInput: {},
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  ChangedColor: { value: Schema.String },
});
export type OutMessage = typeof OutMessage.Type;

export type InitConfig = Readonly<{ id: string; value: string }>;

export const init = ({ id, value }: InitConfig): Model => ({
  id,
  hsv: hexToHsv(value),
  maybeDragTarget: Option.none(),
  maybeHexDraft: Option.none(),
  swatches: RadioGroupPrimitive.init({ id: `${id}-swatches` }),
  popover: PopoverPrimitive.init({ id: `${id}-popover`, isAnimated: true }),
});

const SwatchesBundle = RadioGroupPrimitive.create<string>();

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const withHsv = (model: Model, hsv: Hsv): UpdateReturn => ({
  model: modifyFields(model, { hsv: () => hsv, maybeHexDraft: () => Option.none() }),
  outMessage: OutMessage.ChangedColor({ value: hsvToHex(hsv) }),
});

const clampPercent = Number.clamp({ minimum: 0, maximum: MAX_PERCENT });
const clampHue = Number.clamp({ minimum: 0, maximum: MAX_HUE });

const KEY_STEP = 1;

const keyDelta = (key: string): Readonly<{ horizontal: number; vertical: number }> =>
  Match.value(key).pipe(
    Match.withReturnType<Readonly<{ horizontal: number; vertical: number }>>(),
    Match.when('ArrowLeft', () => ({ horizontal: -KEY_STEP, vertical: 0 })),
    Match.when('ArrowRight', () => ({ horizontal: KEY_STEP, vertical: 0 })),
    Match.when('ArrowUp', () => ({ horizontal: 0, vertical: KEY_STEP })),
    Match.when('ArrowDown', () => ({ horizontal: 0, vertical: -KEY_STEP })),
    Match.orElse(() => ({ horizontal: 0, vertical: 0 })),
  );

const swatchesFold = {
  read: (model: Model) => Option.some(model.swatches),
  write: (model: Model, nextSwatches: RadioGroupPrimitive.Model) =>
    modifyFields(model, { swatches: () => nextSwatches }),
  toParentMessage: (message: RadioGroupPrimitive.Message): Message => Message.GotSwatchesMessage({ message }),
};

const foldSwatches = Update.foldChild({
  update: SwatchesBundle.update,
  ...swatchesFold,
  foldOutMessage: RadioGroupPrimitive.OutMessage.match<Update.StepWithOutMessage<Model, Message, OutMessage>>({
    Selected:
      ({ value }) =>
      (stepModel) =>
        withHsv(stepModel, hexToHsv(value)),
  }),
});

const foldPopover = Update.foldChild({
  update: PopoverPrimitive.update,
  read: (model: Model) => Option.some(model.popover),
  write: (model: Model, nextPopover: PopoverPrimitive.Model) => modifyFields(model, { popover: () => nextPopover }),
  toParentMessage: (message: PopoverPrimitive.Message): Message => Message.GotPopoverMessage({ message }),
  foldOutMessage: PopoverPrimitive.OutMessage.match<Update.Step<Model, Message>>({
    Opened: () => (stepModel) => ({ model: stepModel }),
    Closed: () => (stepModel) => ({ model: stepModel }),
  }),
});

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    GotSwatchesMessage: ({ message: swatchesMessage }) => foldSwatches(model, swatchesMessage),
    GotPopoverMessage: ({ message: popoverMessage }) => foldPopover(model, popoverMessage),
    PressedArea: ({ saturation, brightness }) =>
      withHsv(modifyFields(model, { maybeDragTarget: () => Option.some<DragTarget>('Area') }), {
        ...model.hsv,
        saturation,
        brightness,
      }),
    PressedHue: ({ hue }) =>
      withHsv(modifyFields(model, { maybeDragTarget: () => Option.some<DragTarget>('Hue') }), { ...model.hsv, hue }),
    MovedDragPointer: ({ horizontal, vertical }) =>
      Option.match(model.maybeDragTarget, {
        onNone: () => ({ model }),
        onSome: (target) =>
          withHsv(
            model,
            target === 'Area'
              ? {
                  ...model.hsv,
                  saturation: horizontal * MAX_PERCENT,
                  brightness: MAX_PERCENT - vertical * MAX_PERCENT,
                }
              : { ...model.hsv, hue: horizontal * MAX_HUE },
          ),
      }),
    ReleasedDragPointer: () => ({ model: modifyFields(model, { maybeDragTarget: () => Option.none() }) }),
    PressedAreaKey: ({ key }) => {
      const { horizontal, vertical } = keyDelta(key);
      return withHsv(model, {
        ...model.hsv,
        saturation: clampPercent(model.hsv.saturation + horizontal),
        brightness: clampPercent(model.hsv.brightness + vertical),
      });
    },
    PressedHueKey: ({ key }) => {
      const { horizontal } = keyDelta(key);
      return withHsv(model, { ...model.hsv, hue: clampHue(model.hsv.hue + horizontal) });
    },
    ChangedHexText: ({ text }) =>
      isHex(text)
        ? {
            model: modifyFields(model, { hsv: () => hexToHsv(text), maybeHexDraft: () => Option.some(text) }),
            outMessage: OutMessage.ChangedColor({ value: normalizedHex(text) }),
          }
        : { model: modifyFields(model, { maybeHexDraft: () => Option.some(text) }) },
    BlurredHexInput: () => ({ model: modifyFields(model, { maybeHexDraft: () => Option.none() }) }),
  });

const areaId = (id: string): string => `${id}-area`;
const hueId = (id: string): string => `${id}-hue`;

const fractionsWithin = (element: Element, clientX: number, clientY: number) => {
  const rect = element.getBoundingClientRect();
  const clampFraction = Number.clamp({ minimum: 0, maximum: 1 });
  return {
    horizontal: rect.width === 0 ? 0 : clampFraction((clientX - rect.left) / rect.width),
    vertical: rect.height === 0 ? 0 : clampFraction((clientY - rect.top) / rect.height),
  };
};

const DragDependency = Schema.Struct({ id: Schema.String, maybeDragTarget: Schema.Option(DragTarget) });

export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  dragPointer: entry(DragDependency.fields, {
    modelToDependencies: (model) => ({ id: model.id, maybeDragTarget: model.maybeDragTarget }),
    dependenciesToStream: ({ id, maybeDragTarget }) =>
      Stream.when(
        Stream.merge(
          Stream.fromEventListener<PointerEvent>(document, 'pointermove').pipe(
            Stream.map((event) =>
              pipe(
                maybeDragTarget,
                Option.flatMapNullishOr((target) =>
                  document.getElementById(target === 'Area' ? areaId(id) : hueId(id)),
                ),
                Option.map((element) =>
                  Message.MovedDragPointer(fractionsWithin(element, event.clientX, event.clientY)),
                ),
              ),
            ),
            Stream.filter(Option.isSome),
            Stream.map((maybeMessage) => maybeMessage.value),
          ),
          Stream.fromEventListener<PointerEvent>(document, 'pointerup').pipe(
            Stream.map(() => Message.ReleasedDragPointer()),
          ),
        ),
        Effect.sync(() => Option.isSome(maybeDragTarget)),
      ),
  }),
}));

const swatchClassName = cn(
  'group/swatch hit-area relative flex size-control-sm shrink-0 items-center justify-center rounded-full outline-none',
  'inset-ring-2 inset-ring-transparent transition-shadow duration-feedback data-checked:inset-ring-(--swatch)',
  'focus-visible:ring-3 focus-visible:ring-ring/24',
  'disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50',
);

const swatchFillClassName = cn(
  'size-full rounded-full inset-ring inset-ring-black/10 transition-[scale] duration-indicator ease-spring-bounce motion-reduce:transition-none dark:inset-ring-white/12',
  'scale-100 group-hover/swatch:scale-[0.92] group-active/swatch:scale-[0.84] group-data-checked/swatch:scale-[0.625] group-data-checked/swatch:group-active/swatch:scale-[0.58]',
);

const pointerClassName =
  'pointer-events-none absolute z-1 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform group-focus/interactive:scale-110';

const LEFT_MOUSE_BUTTON = 0;

const percentStyle = (value: number): string => `${value}%`;

export type CustomColorConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  value: string;
  hexLabel?: string | undefined;
}>;

export const customColor = <ParentMessage>(
  config: CustomColorConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const { model, toParentMessage, value, hexLabel = DEFAULT_HEX_LABEL } = config;
  const hsv = hsvToHex(model.hsv) === value ? model.hsv : hexToHsv(value);
  const pressedAt =
    (toMessage: (fractions: Readonly<{ horizontal: number; vertical: number }>) => Message) =>
    (
      _pointerType: string,
      button: number,
      _screenX: number,
      _screenY: number,
      _timeStamp: number,
      clientX: number,
      clientY: number,
      _pointerId: number,
      target: EventTarget | null,
    ): Option.Option<ParentMessage> =>
      pipe(
        Option.liftPredicate(target, (candidate): candidate is Element => candidate instanceof Element),
        Option.filter(() => button === LEFT_MOUSE_BUTTON),
        Option.flatMapNullishOr((element) => element.closest('[data-slot=color-interactive]')),
        Option.map((element) => toParentMessage(toMessage(fractionsWithin(element, clientX, clientY)))),
      );

  const keyHandler =
    (toMessage: (key: string) => Message) =>
    (key: string): Option.Option<ParentMessage> =>
      Array.contains(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], key)
        ? Option.some(toParentMessage(toMessage(key)))
        : Option.none();

  const hexText = Option.getOrElse(model.maybeHexDraft, () => value);

  return h.div(
    [h.DataAttribute('slot', 'color-picker-custom'), h.Class('flex flex-col gap-(--color-picker-row-gap)')],
    [
      h.div(
        [h.Class('flex h-40 w-full flex-col select-none')],
        [
          h.div(
            [
              h.Class('relative grow rounded-inner'),
              h.Style({ backgroundColor: hueColor(hsv.hue), backgroundImage: SATURATION_GRADIENT }),
            ],
            [
              h.div(
                [
                  h.Id(areaId(model.id)),
                  h.DataAttribute('slot', 'color-interactive'),
                  h.Role('slider'),
                  h.AriaLabel('Color'),
                  h.Attribute(
                    'aria-valuetext',
                    `Saturation ${Math.round(hsv.saturation)}%, Brightness ${Math.round(hsv.brightness)}%`,
                  ),
                  h.Tabindex(0),
                  h.OnPointerDown(
                    pressedAt(({ horizontal, vertical }) =>
                      Message.PressedArea({
                        saturation: horizontal * MAX_PERCENT,
                        brightness: MAX_PERCENT - vertical * MAX_PERCENT,
                      }),
                    ),
                  ),
                  h.OnKeyDownPreventDefault(keyHandler((key) => Message.PressedAreaKey({ key }))),
                  h.Class('group/interactive absolute inset-0 touch-none rounded-[inherit] outline-none'),
                ],
                [
                  h.div([
                    h.Class(pointerClassName),
                    h.Style({
                      top: percentStyle(MAX_PERCENT - hsv.brightness),
                      left: percentStyle(hsv.saturation),
                      backgroundColor: hsvToHex(hsv),
                    }),
                  ]),
                ],
              ),
            ],
          ),
          h.div(
            [
              h.Class('relative mt-picker h-(--color-picker-hue) shrink-0 rounded-track'),
              h.Style({ backgroundImage: HUE_GRADIENT }),
            ],
            [
              h.div(
                [
                  h.Id(hueId(model.id)),
                  h.DataAttribute('slot', 'color-interactive'),
                  h.Role('slider'),
                  h.AriaLabel('Hue'),
                  h.Attribute('aria-valuenow', globalThis.String(Math.round(hsv.hue))),
                  h.Attribute('aria-valuemin', '0'),
                  h.Attribute('aria-valuemax', globalThis.String(MAX_HUE)),
                  h.Tabindex(0),
                  h.OnPointerDown(pressedAt(({ horizontal }) => Message.PressedHue({ hue: horizontal * MAX_HUE }))),
                  h.OnKeyDownPreventDefault(keyHandler((key) => Message.PressedHueKey({ key }))),
                  h.Class('group/interactive absolute inset-0 touch-none rounded-[inherit] outline-none'),
                ],
                [
                  h.div([
                    h.Class(pointerClassName),
                    h.Style({
                      top: '50%',
                      left: percentStyle((hsv.hue / MAX_HUE) * MAX_PERCENT),
                      backgroundColor: hueColor(hsv.hue),
                    }),
                  ]),
                ],
              ),
            ],
          ),
        ],
      ),
      InputGroup.view(
        {
          children: [
            InputGroup.addon(
              {
                children: [
                  h.span([
                    h.AriaHidden(true),
                    h.Class('size-icon rounded-full inset-ring inset-ring-black/10 dark:inset-ring-white/12'),
                    h.Style({ background: value }),
                  ]),
                ],
              },
              h,
            ),
            h.span(
              [
                h.DataAttribute('slot', 'input-group-input'),
                h.Class(
                  'flex h-full min-w-0 flex-1 items-center px-[calc(var(--spacing-field-pad)-1px)] text-control max-md:text-[1rem]',
                ),
              ],
              [
                h.input([
                  h.DataAttribute('slot', 'input-group-control'),
                  h.AriaLabel(hexLabel),
                  h.Type('text'),
                  h.Autocomplete('off'),
                  h.Spellcheck(false),
                  h.Value(hexText.startsWith('#') ? hexText : `#${hexText}`),
                  h.OnInput((text) => toParentMessage(Message.ChangedHexText({ text }))),
                  h.OnBlur(toParentMessage(Message.BlurredHexInput())),
                  h.Class(
                    'h-full w-full min-w-0 flex-1 bg-transparent p-0 font-mono uppercase outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed',
                  ),
                ]),
              ],
            ),
          ],
        },
        h,
      ),
    ],
  );
};

export type CustomMode = 'Popover' | 'Inline' | 'None';

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  value: string;
  presets?: ReadonlyArray<ColorPreset> | undefined;
  custom?: CustomMode | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledBy?: string | undefined;
  customLabel?: string | undefined;
  hexLabel?: string | undefined;
}>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    value,
    presets = DEFAULT_PRESETS,
    custom = 'Popover',
    ariaLabel = DEFAULT_LABEL,
    ariaLabelledBy,
    customLabel = DEFAULT_CUSTOM_LABEL,
    hexLabel,
  } = config;

  const normalized = value.toLowerCase();
  const maybePreset = Array.findFirst(presets, (preset) => preset.value.toLowerCase() === normalized);
  const isCustom = Option.isNone(maybePreset);
  const labelOf = (presetValue: string): string =>
    pipe(
      presets,
      Array.findFirst((preset) => preset.value === presetValue),
      Option.match({ onNone: () => presetValue, onSome: ({ label }) => label }),
    );

  const customColorView = customColor(
    { model, toParentMessage, value, ...(hexLabel === undefined ? {} : { hexLabel }) },
    h,
  );

  const customSwatch = h.submodel({
    slotId: model.popover.id,
    model: model.popover,
    view: PopoverPrimitive.view,
    viewInputs: {
      anchor: { placement: 'bottom-start', gap: 8, padding: 8 },
      toView: (render: PopoverPrimitive.RenderInfo) =>
        h.div(
          [h.Class('relative inline-flex')],
          [
            h.button(
              [
                ...render.button,
                h.Type('button'),
                ...(isCustom ? [h.DataAttribute('checked', '')] : []),
                h.AriaLabel(isCustom ? `${customLabel}: ${value}` : customLabel),
                h.Title(customLabel),
                h.Class(swatchClassName),
                h.Style({ '--swatch': isCustom ? value : 'var(--foreground)' }),
              ],
              [
                h.span([
                  h.AriaHidden(true),
                  h.Class(swatchFillClassName),
                  h.Style({ background: isCustom ? 'var(--swatch)' : CUSTOM_GRADIENT }),
                ]),
              ],
            ),
            ...(render.isVisible
              ? [
                  h.div([...render.backdrop, h.Class('fixed inset-0 z-40')]),
                  h.div(
                    [
                      ...render.panel,
                      h.Role('dialog'),
                      h.DataAttribute('slot', 'popover-content'),
                      h.DataAttribute('surface', 'popup'),
                      h.Class(cn(Popover.popupClassName, 'w-60 p-picker [--outer-inset:var(--spacing-picker)]')),
                    ],
                    [customColorView],
                  ),
                ]
              : []),
          ],
        ),
    },
    toParentMessage: (message: PopoverPrimitive.Message) => toParentMessage(Message.GotPopoverMessage({ message })),
  });

  const swatches = h.submodel({
    slotId: model.swatches.id,
    model: model.swatches,
    view: SwatchesBundle.view,
    viewInputs: {
      options: Array.map(presets, (preset) => preset.value),
      selectedValue: Option.map(maybePreset, (preset) => preset.value),
      ariaLabel,
      orientation: 'Horizontal',
      toView: (render: RadioGroupPrimitive.RenderInfo<string>) =>
        h.div(
          [
            ...render.group,
            ...(ariaLabelledBy === undefined ? [] : [h.AriaLabelledBy(ariaLabelledBy)]),
            h.DataAttribute('slot', 'color-picker'),
            h.Class(
              cn(
                'flex w-full flex-wrap gap-related pointer-coarse:gap-3',
                custom === 'Inline' && 'grid grid-cols-6 justify-between gap-y-(--color-picker-row-gap)',
              ),
            ),
          ],
          [
            ...Array.map(render.options, (option) =>
              h.button(
                [
                  ...option.option,
                  h.AriaLabel(labelOf(option.value)),
                  h.Title(labelOf(option.value)),
                  h.Class(swatchClassName),
                  h.Style({ '--swatch': option.value }),
                ],
                [h.span([h.AriaHidden(true), h.Class(swatchFillClassName), h.Style({ background: 'var(--swatch)' })])],
              ),
            ),
            ...(custom === 'Popover' ? [customSwatch] : []),
          ],
        ),
    },
    toParentMessage: (message: RadioGroupPrimitive.Message) => toParentMessage(Message.GotSwatchesMessage({ message })),
  });

  return custom === 'Inline' ? h.div([h.Class('flex flex-col gap-picker')], [swatches, customColorView]) : swatches;
};

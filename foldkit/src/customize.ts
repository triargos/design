import { BrowserKeyValueStore } from '@effect/platform-browser';
import { Array, Effect, Option, Record, Schema } from 'effect';
import { KeyValueStore } from 'effect/persistence';
import { Command, Submodel, Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { defineTaggedUnion } from 'foldkit/schema';
import { modifyFields } from 'foldkit/struct';

import {
  DEFAULT_TOKEN_GLOBALS,
  TOKEN_GROUPS,
  type TunableToken,
  formatToken,
  sizingGlobals,
  tokenCss,
  tokenValue,
} from '../../docs/kit/tokens.ts';
import { BRAND_ANCHORS } from '../../src/lib/theme/brand-anchors.ts';
import { brandingThemeCss } from '../../src/lib/theme/branding-theme.ts';
import {
  BRAND_BASE_COLORS,
  BRAND_DESTRUCTIVE_COLORS,
  BRAND_PRIMARY_COLORS,
  DEFAULT_BRANDING_THEME,
} from '../../src/lib/theme/branding.ts';
import { toCss } from '../../src/lib/theme/color.ts';
import {
  DENSITIES,
  RADII,
  SIZING_STYLES,
  type SizingTheme,
  scaleDensity,
  sizingThemeCss,
  sizingValues,
} from '../../src/lib/theme/sizing.ts';
import * as Accordion from './pavo/accordion.ts';
import * as Button from './pavo/button.ts';
import { cn } from './pavo/cn.ts';
import { icon } from './pavo/icon.ts';
import * as Popover from './pavo/popover.ts';
import * as Slider from './pavo/slider.ts';
import * as Tabs from './pavo/tabs.ts';

const STORAGE_KEY = 'pavo-foldkit-customization';

const SIZING_STYLE_NAMES = Record.keys(SIZING_STYLES);
const DENSITY_NAMES = Record.keys(DENSITIES);
const RADIUS_NAMES = Record.keys(RADII);

const SizingStyle = Schema.Literals(SIZING_STYLE_NAMES);
type SizingStyle = typeof SizingStyle.Type;
const DensityName = Schema.Literals(DENSITY_NAMES);
type DensityName = typeof DensityName.Type;
const Radius = Schema.Literals(RADIUS_NAMES);
type Radius = typeof Radius.Type;

const PrimaryColor = Schema.Literals(BRAND_PRIMARY_COLORS);
const BaseColor = Schema.Literals(BRAND_BASE_COLORS);
const DestructiveColor = Schema.Literals(BRAND_DESTRUCTIVE_COLORS);

const Font = Schema.Literals(['Inter', 'Geist', 'CalSans']);
type Font = typeof Font.Type;

const FONT_FAMILIES: Record<Font, Readonly<{ label: string; family: string }>> = {
  Inter: { label: 'Inter', family: "'Inter Variable', sans-serif" },
  Geist: { label: 'Geist', family: "'Geist', sans-serif" },
  CalSans: { label: 'Cal Sans', family: "'Cal Sans', sans-serif" },
};

const STYLE_LABELS: Record<SizingStyle, string> = { pavo: 'Pavo', coss: 'Coss', dense: 'Dense', soft: 'Soft' };

const SCALE = { min: 0.8, max: 1.25, step: 0.025 } as const;
const SCALE_PRECISION = 1000;

export const Density = defineTaggedUnion({
  Named: { density: DensityName },
  Scaled: { factor: Schema.Number },
});
export type Density = typeof Density.Type;

export const Sizing = Schema.Struct({
  maybeStyle: Schema.OptionFromNullOr(SizingStyle),
  density: Density,
  radius: Radius,
});
export type Sizing = typeof Sizing.Type;

export const Branding = Schema.Struct({
  primaryColor: PrimaryColor,
  baseColor: BaseColor,
  destructiveColor: DestructiveColor,
});
export type Branding = typeof Branding.Type;

export const Customization = Schema.Struct({
  branding: Branding,
  sizing: Sizing,
  tokens: Schema.Record(Schema.String, Schema.Number),
  font: Font,
});
export type Customization = typeof Customization.Type;

const CustomizationJson = Schema.fromJsonString(Customization);

const styleSizing = (style: SizingStyle): Sizing => {
  const { density, radius } = SIZING_STYLES[style];
  return { maybeStyle: Option.some(style), density: Density.Named({ density }), radius };
};

const axesSizing = (density: Density, radius: Radius): Sizing =>
  density._tag === 'Named' && density.density === 'default' && radius === 'default'
    ? styleSizing('pavo')
    : { maybeStyle: Option.none(), density, radius };

const sizingTheme = ({ maybeStyle, density, radius }: Sizing): SizingTheme =>
  Option.match(maybeStyle, {
    onSome: (style) => SIZING_STYLES[style],
    onNone: () => ({
      density: Density.match(density, {
        Named: ({ density: name }) => name,
        Scaled: ({ factor }) => scaleDensity(factor),
      }),
      radius,
    }),
  });

const themeGlobals = (sizing: Sizing): Record<string, number> => ({
  ...DEFAULT_TOKEN_GLOBALS,
  ...sizingGlobals(sizingValues(sizingTheme(sizing)).base),
});

export const DEFAULT_CUSTOMIZATION: Customization = {
  branding: DEFAULT_BRANDING_THEME,
  sizing: styleSizing('pavo'),
  tokens: {},
  font: 'Inter',
};

const isCustomized = (customization: Customization): boolean =>
  !Schema.toEquivalence(Customization)(customization, DEFAULT_CUSTOMIZATION);

export const loadCustomization: Effect.Effect<Customization> = Effect.gen(function* () {
  const store = yield* KeyValueStore.KeyValueStore;
  const json = yield* Effect.fromOption(Option.fromNullishOr(yield* store.get(STORAGE_KEY)));
  return yield* Schema.decodeEffect(CustomizationJson)(json);
}).pipe(
  Effect.catch(() => Effect.succeed(DEFAULT_CUSTOMIZATION)),
  Effect.provide(BrowserKeyValueStore.layerLocalStorage),
);

const TUNABLE_TOKENS = Array.flatMap(TOKEN_GROUPS, (group) => group.tokens);

const sliderId = (token: TunableToken): string => `customize-${token.global}`;

const sliderMax = (token: TunableToken): number => (token.full === undefined ? token.max : token.max + token.step);

const tokenSliderInit = (token: TunableToken): Slider.Model =>
  Slider.init({ id: sliderId(token), min: token.min, max: sliderMax(token), step: token.step });

export const Model = Schema.Struct({
  customization: Customization,
  popover: Popover.Model,
  scaleSlider: Slider.Model,
  tokenSliders: Schema.Record(Schema.String, Slider.Model),
  openTokenGroups: Schema.Array(Schema.String),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ChangedFont: { font: Font },
  ChangedSizingStyle: { style: SizingStyle },
  ChangedDensity: { density: DensityName },
  ChangedRadius: { radius: Radius },
  ChangedPrimaryColor: { primaryColor: PrimaryColor },
  ChangedBaseColor: { baseColor: BaseColor },
  ChangedDestructiveColor: { destructiveColor: DestructiveColor },
  ChangedOpenTokenGroups: { openTokenGroups: Schema.Array(Schema.String) },
  ClickedReset: {},
  CompletedSaveCustomization: {},
  GotPopoverMessage: { message: Popover.Message },
  GotScaleSliderMessage: { message: Slider.Message },
  GotTokenSliderMessage: { global: Schema.String, message: Slider.Message },
});
export type Message = typeof Message.Type;

const SaveCustomization = Command.define('SaveCustomization', {
  args: { customization: Customization },
  messages: [Message.CompletedSaveCustomization],
  execute: ({ customization }) =>
    Effect.gen(function* () {
      const store = yield* KeyValueStore.KeyValueStore;
      if (isCustomized(customization)) {
        const json = yield* Schema.encodeEffect(CustomizationJson)(customization);
        yield* store.set(STORAGE_KEY, json);
      } else {
        yield* store.remove(STORAGE_KEY);
      }
      return Message.CompletedSaveCustomization();
    }).pipe(
      Effect.catch(() => Effect.succeed(Message.CompletedSaveCustomization())),
      Effect.provide(BrowserKeyValueStore.layerLocalStorage),
    ),
});

export const init = (customization: Customization): Model => ({
  customization,
  popover: Popover.init({ id: 'customize' }),
  scaleSlider: Slider.init({ id: 'customize-scale', min: SCALE.min, max: SCALE.max, step: SCALE.step }),
  tokenSliders: Record.fromEntries(Array.map(TUNABLE_TOKENS, (token) => [token.global, tokenSliderInit(token)])),
  openTokenGroups: [],
});

type UpdateReturn = Update.Return<Model, Message>;

const withCustomization = (model: Model, nextCustomization: Customization): UpdateReturn => ({
  model: modifyFields(model, { customization: () => nextCustomization }),
  commands: [SaveCustomization({ customization: nextCustomization })],
});

const withSizing = (model: Model, nextSizing: Sizing): UpdateReturn => {
  const nextBaseline = themeGlobals(nextSizing);
  const keptTokens = Record.filter(model.customization.tokens, (value, global) => nextBaseline[global] !== value);
  return withCustomization(model, { ...model.customization, sizing: nextSizing, tokens: keptTokens });
};

const withBranding = (model: Model, branding: Partial<Branding>): UpdateReturn =>
  withCustomization(model, {
    ...model.customization,
    branding: { ...model.customization.branding, ...branding },
  });

const withScale = (model: Model, scale: number): UpdateReturn => {
  const factor = Math.round(scale * SCALE_PRECISION) / SCALE_PRECISION;
  const density = factor === 1 ? Density.Named({ density: 'default' }) : Density.Scaled({ factor });
  return withSizing(model, axesSizing(density, model.customization.sizing.radius));
};

const findToken = (global: string): Option.Option<TunableToken> =>
  Array.findFirst(TUNABLE_TOKENS, (token) => token.global === global);

const withToken = (model: Model, global: string, position: number): UpdateReturn =>
  Option.match(findToken(global), {
    onNone: () => ({ model }),
    onSome: (token) => {
      const value = token.full !== undefined && position > token.max ? token.full : position;
      const baseline = themeGlobals(model.customization.sizing)[global];
      const withoutToken = Record.remove(model.customization.tokens, global);
      const nextTokens = value === baseline ? withoutToken : Record.set(withoutToken, global, value);
      return withCustomization(model, { ...model.customization, tokens: nextTokens });
    },
  });

const toPopoverMessage = (message: Popover.Message): Message => Message.GotPopoverMessage({ message });
const toScaleSliderMessage = (message: Slider.Message): Message => Message.GotScaleSliderMessage({ message });
const toTokenSliderMessage =
  (global: string) =>
  (message: Slider.Message): Message =>
    Message.GotTokenSliderMessage({ global, message });

const foldPopover = Update.foldChild({
  update: Popover.update,
  read: (model: Model) => Option.some(model.popover),
  write: (model, nextPopover) => modifyFields(model, { popover: () => nextPopover }),
  toParentMessage: toPopoverMessage,
  foldOutMessage: Popover.OutMessage.match<Update.Step<Model, Message>>({
    Opened: () => (stepModel) => ({ model: stepModel }),
    Closed: () => (stepModel) => ({ model: stepModel }),
  }),
});

const foldScaleSlider = Update.foldChild({
  update: Slider.update,
  read: (model: Model) => Option.some(model.scaleSlider),
  write: (model, nextScaleSlider) => modifyFields(model, { scaleSlider: () => nextScaleSlider }),
  toParentMessage: toScaleSliderMessage,
  foldOutMessage: Slider.OutMessage.match<Update.Step<Model, Message>>({
    ChangedValue:
      ({ value }) =>
      (stepModel) =>
        withScale(stepModel, value),
  }),
});

const foldTokenSlider = Update.foldChildAt({
  update: Slider.update,
  readAt: (model: Model, global: string) => Record.get(model.tokenSliders, global),
  writeAt: (model: Model, global: string, nextSlider: Slider.Model) =>
    modifyFields(model, { tokenSliders: Record.set(global, nextSlider) }),
  toParentMessage: (global: string, message: Slider.Message) => toTokenSliderMessage(global)(message),
  foldOutMessage: (global: string) =>
    Slider.OutMessage.match<Update.Step<Model, Message>>({
      ChangedValue:
        ({ value }) =>
        (stepModel) =>
          withToken(stepModel, global, value),
    }),
});

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    ChangedFont: ({ font }) => withCustomization(model, { ...model.customization, font }),
    ChangedSizingStyle: ({ style }) => withSizing(model, styleSizing(style)),
    ChangedDensity: ({ density }) =>
      withSizing(model, axesSizing(Density.Named({ density }), model.customization.sizing.radius)),
    ChangedRadius: ({ radius }) => withSizing(model, axesSizing(model.customization.sizing.density, radius)),
    ChangedPrimaryColor: ({ primaryColor }) => withBranding(model, { primaryColor }),
    ChangedBaseColor: ({ baseColor }) => withBranding(model, { baseColor }),
    ChangedDestructiveColor: ({ destructiveColor }) => withBranding(model, { destructiveColor }),
    ChangedOpenTokenGroups: ({ openTokenGroups }) => ({
      model: modifyFields(model, { openTokenGroups: () => openTokenGroups }),
    }),
    ClickedReset: () => withCustomization(model, DEFAULT_CUSTOMIZATION),
    CompletedSaveCustomization: () => ({ model }),
    GotPopoverMessage: ({ message }) => foldPopover(model, message),
    GotScaleSliderMessage: ({ message }) => foldScaleSlider(model, message),
    GotTokenSliderMessage: ({ global, message }) => foldTokenSlider(model, global, message),
  });

const scaleSliderSubscriptions = Subscription.lift({
  customizeScalePointer: Slider.subscriptions.dragPointer,
  customizeScaleEscape: Slider.subscriptions.dragEscape,
})<Model, Message>({
  read: (model) => Option.some(model.scaleSlider),
  toParentMessage: toScaleSliderMessage,
});

const tokenSliderSubscriptions = (token: TunableToken) =>
  Subscription.lift({
    [`customize-${token.global}-pointer`]: Slider.subscriptions.dragPointer,
    [`customize-${token.global}-escape`]: Slider.subscriptions.dragEscape,
  })<Model, Message>({
    read: (model) => Record.get(model.tokenSliders, token.global),
    toParentMessage: toTokenSliderMessage(token.global),
  });

export const subscriptions = Subscription.aggregate<Model, Message>()(
  scaleSliderSubscriptions,
  ...Array.map(TUNABLE_TOKENS, tokenSliderSubscriptions),
);

export const customizationCss = (customization: Customization): ReadonlyArray<string> => [
  brandingThemeCss(customization.branding),
  sizingThemeCss(sizingTheme(customization.sizing)),
  tokenCss(customization.tokens),
  customization.font === 'Inter' ? '' : `:root{--font-sans:${FONT_FAMILIES[customization.font].family};}`,
];

const groupHeading = (id: string, label: string, aside: ReadonlyArray<Html | string>, h: HtmlBuilder<Message>): Html =>
  h.span([h.Id(id), h.Class('flex items-baseline justify-between text-body font-medium')], [label, ...aside]);

const segmented = <Value extends string>(
  id: string,
  label: string,
  values: ReadonlyArray<Value>,
  maybeValue: Option.Option<Value>,
  toLabel: (value: Value) => string,
  toMessage: (value: string) => Option.Option<Message>,
  h: HtmlBuilder<Message>,
  aside: ReadonlyArray<Html | string> = [],
  extra: ReadonlyArray<Html> = [],
): Html =>
  h.div(
    [h.Role('group'), h.AriaLabelledBy(id), h.Class('flex flex-col gap-related')],
    [
      groupHeading(id, label, aside, h),
      Tabs.radioGroup(
        {
          variant: 'segmented',
          ariaLabelledBy: id,
          value: Option.getOrElse(maybeValue, () => ''),
          onValueChange: (value) => Option.getOrElse(toMessage(value), () => Message.CompletedSaveCustomization()),
          className: 'w-full',
          radios: Array.map(values, (value) => ({ value, className: 'flex-1 capitalize', children: [toLabel(value)] })),
        },
        h,
      ),
      ...extra,
    ],
  );

const decodeOption =
  <A extends string>(schema: Schema.Codec<A, A>) =>
  (value: string): Option.Option<A> =>
    Schema.decodeUnknownOption(schema)(value);

const swatches = <Color extends keyof typeof BRAND_ANCHORS>(
  legend: string,
  name: string,
  colors: ReadonlyArray<Color>,
  value: Color,
  toMessage: (color: Color) => Message,
  h: HtmlBuilder<Message>,
): Html =>
  h.fieldset(
    [h.Class('flex flex-col gap-related')],
    [
      h.legend(
        [h.Class('mb-related flex w-full items-baseline justify-between text-body font-medium')],
        [legend, h.span([h.Class('text-caption font-normal text-muted-foreground capitalize')], [value])],
      ),
      h.div(
        [h.Class('flex flex-wrap gap-1.5')],
        Array.map(colors, (color) =>
          h.label(
            [
              h.Title(color),
              h.Style({ 'background-color': toCss('LCH', BRAND_ANCHORS[color]) }),
              h.Class(
                cn(
                  'relative size-7 cursor-pointer rounded-full ring-1 ring-black/10 ring-inset dark:ring-white/10',
                  'outline-offset-2 has-checked:outline-2 has-checked:outline-foreground has-focus-visible:outline-2 has-focus-visible:outline-ring',
                ),
              ),
            ],
            [
              h.input([
                h.Type('radio'),
                h.Name(name),
                h.Value(color),
                h.Checked(color === value),
                h.OnChange(() => toMessage(color)),
                h.Class('sr-only'),
              ]),
              h.span([h.Class('sr-only')], [color]),
            ],
          ),
        ),
      ),
    ],
  );

const tokenSlider = (
  model: Model,
  token: TunableToken,
  value: number,
  baseline: number,
  h: HtmlBuilder<Message>,
): Html =>
  Option.match(Record.get(model.tokenSliders, token.global), {
    onNone: () => null,
    onSome: (sliderModel) => {
      const position = token.full !== undefined && value === token.full ? token.max + token.step : value;
      return h.div(
        [h.Class('flex flex-col gap-tight')],
        [
          h.div(
            [h.Class('flex items-baseline justify-between text-caption')],
            [
              h.span([h.Class('text-foreground capitalize')], [token.label]),
              h.span(
                [h.Class(cn('tabular-nums', value === baseline ? 'text-muted-foreground' : 'text-foreground'))],
                [formatToken(token, value)],
              ),
            ],
          ),
          Slider.view(
            {
              model: sliderModel,
              toParentMessage: toTokenSliderMessage(token.global),
              value: position,
              ariaLabel: token.label,
            },
            h,
          ),
        ],
      );
    },
  });

const scaleOf = (density: Density): Option.Option<number> =>
  Density.match(density, {
    Named: () => Option.none(),
    Scaled: ({ factor }) => Option.some(factor),
  });

const densityNameOf = (density: Density): Option.Option<DensityName> =>
  Density.match(density, {
    Named: ({ density: name }) => Option.some(name),
    Scaled: () => Option.none(),
  });

const panel = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const { customization } = model;
  const { branding, sizing } = customization;
  const baseline = themeGlobals(sizing);
  const globals = { ...baseline, ...customization.tokens };
  const maybeScale = scaleOf(sizing.density);

  return [
    Popover.header(
      {
        className: 'px-group pt-group pb-related',
        children: [
          Popover.title({ children: ['Customize'] }, h),
          Popover.description(
            { children: ['Font, brand colors, sizing and token scales for every page. Saved in this browser.'] },
            h,
          ),
        ],
      },
      h,
    ),
    h.div(
      [h.Class('flex min-h-0 flex-1 flex-col gap-group overflow-y-auto px-group py-related')],
      [
        h.div(
          [h.Role('group'), h.AriaLabelledBy('customize-font'), h.Class('flex flex-col gap-related')],
          [
            groupHeading('customize-font', 'Font', [], h),
            Tabs.radioGroup(
              {
                variant: 'segmented',
                ariaLabelledBy: 'customize-font',
                value: customization.font,
                onValueChange: (value) =>
                  Option.match(decodeOption(Font)(value), {
                    onNone: () => Message.CompletedSaveCustomization(),
                    onSome: (font) => Message.ChangedFont({ font }),
                  }),
                className: 'w-full',
                radios: Array.map(Font.literals, (font) => ({
                  value: font,
                  className: 'flex-1',
                  children: [
                    h.span([h.Style({ 'font-family': FONT_FAMILIES[font].family })], [FONT_FAMILIES[font].label]),
                  ],
                })),
              },
              h,
            ),
          ],
        ),
        segmented(
          'customize-style',
          'Style',
          SIZING_STYLE_NAMES,
          sizing.maybeStyle,
          (style) => STYLE_LABELS[style],
          (value) => Option.map(decodeOption(SizingStyle)(value), (style) => Message.ChangedSizingStyle({ style })),
          h,
          Option.isNone(sizing.maybeStyle)
            ? [h.span([h.Class('text-caption font-normal text-muted-foreground')], ['Custom'])]
            : [],
        ),
        segmented(
          'customize-density',
          'Density',
          DENSITY_NAMES,
          densityNameOf(sizing.density),
          (density) => density,
          (value) => Option.map(decodeOption(DensityName)(value), (density) => Message.ChangedDensity({ density })),
          h,
          [],
          [
            h.div(
              [h.Class('flex items-baseline justify-between text-caption')],
              [
                h.span([h.Class('text-foreground')], ['Scale']),
                h.span(
                  [
                    h.Class(
                      cn('tabular-nums', Option.isSome(maybeScale) ? 'text-foreground' : 'text-muted-foreground'),
                    ),
                  ],
                  [
                    Option.match(maybeScale, {
                      onNone: () => '×1 (named)',
                      onSome: (factor) => `×${factor.toFixed(3)}`,
                    }),
                  ],
                ),
              ],
            ),
            Slider.view(
              {
                model: model.scaleSlider,
                toParentMessage: toScaleSliderMessage,
                value: Option.getOrElse(maybeScale, () => 1),
                ariaLabel: 'Scale',
              },
              h,
            ),
          ],
        ),
        segmented(
          'customize-radius',
          'Radius',
          RADIUS_NAMES,
          Option.some(sizing.radius),
          (radius) => radius,
          (value) => Option.map(decodeOption(Radius)(value), (radius) => Message.ChangedRadius({ radius })),
          h,
        ),
        swatches(
          'Primary',
          'customize-primary',
          BRAND_PRIMARY_COLORS,
          branding.primaryColor,
          (primaryColor) => Message.ChangedPrimaryColor({ primaryColor }),
          h,
        ),
        swatches(
          'Base',
          'customize-base',
          BRAND_BASE_COLORS,
          branding.baseColor,
          (baseColor) => Message.ChangedBaseColor({ baseColor }),
          h,
        ),
        swatches(
          'Destructive',
          'customize-destructive',
          BRAND_DESTRUCTIVE_COLORS,
          branding.destructiveColor,
          (destructiveColor) => Message.ChangedDestructiveColor({ destructiveColor }),
          h,
        ),
        Accordion.view(
          {
            id: 'customize-tokens',
            isMultiple: true,
            openValues: model.openTokenGroups,
            onOpenValuesChange: (openTokenGroups) => Message.ChangedOpenTokenGroups({ openTokenGroups }),
            items: Array.map(TOKEN_GROUPS, (group) => ({
              value: group.title,
              trigger: [group.title],
              contentClassName: 'flex flex-col gap-group',
              content: Array.map(group.tokens, (token) =>
                tokenSlider(model, token, tokenValue(globals, token), tokenValue(baseline, token), h),
              ),
            })),
          },
          h,
        ),
      ],
    ),
    h.div(
      [h.Class('border-t border-border-subtle p-related')],
      [
        Button.view(
          {
            className: 'w-full',
            isDisabled: !isCustomized(customization),
            onClick: Message.ClickedReset(),
            children: [icon('rotate', { dataIcon: 'inline-start' }), 'Reset to defaults'],
          },
          h,
        ),
      ],
    ),
  ];
};

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  h.div(
    [h.Class('fixed right-5 bottom-5 z-40')],
    [
      Popover.view(
        {
          model: model.popover,
          toParentMessage: toPopoverMessage,
          side: 'top',
          align: 'end',
          sideOffset: 10,
          className: 'max-h-[min(calc(100dvh-6rem),40rem)] w-[min(20rem,calc(100vw-2.5rem))] gap-0 overflow-hidden p-0',
          trigger: {
            ariaLabel: 'Customize',
            className: cn(
              'size-10 rounded-full border-0 bg-neutral-solid bg-none p-0 text-neutral-solid-foreground shadow-popup hover:bg-neutral-solid dark:bg-neutral-solid dark:hover:bg-neutral-solid',
              'transition-transform duration-feedback ease-out focus-visible:ring-3 focus-visible:ring-ring/24 active:scale-96 aria-expanded:scale-96 aria-expanded:bg-neutral-solid motion-reduce:transition-none',
            ),
            children: [
              icon('adjustments-horizontal', { className: 'size-4' }),
              ...(isCustomized(model.customization)
                ? [
                    h.span([
                      h.AriaLabel('(changed)'),
                      h.Class(
                        'absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary-solid ring-2 ring-background',
                      ),
                    ]),
                  ]
                : []),
            ],
          },
          content: () => panel(model, h),
        },
        h,
      ),
    ],
  ),
);

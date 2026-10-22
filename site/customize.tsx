import { animate, motion, type PanInfo, useMotionValue, useReducedMotion } from 'framer-motion';
import { IconAdjustmentsHorizontal, IconRotate } from '@tabler/icons-react';
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Slider } from '~/components/ui/slider';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

import { BRAND_ANCHORS, type BrandColor } from '~/lib/theme/brand-anchors';
import {
  BRAND_BASE_COLORS,
  BRAND_DESTRUCTIVE_COLORS,
  BRAND_PRIMARY_COLORS,
  type BrandingTheme,
  DEFAULT_BRANDING_THEME,
} from '~/lib/theme/branding';
import { brandingThemeCss } from '~/lib/theme/branding-theme';
import { toCss } from '~/lib/theme/color';
import {
  DENSITIES,
  type Density,
  RADII,
  type Radius,
  SIZING_STYLES,
  type SizingStyle,
  type SizingTheme,
  scaleDensity,
  sizingThemeCss,
  sizingValues,
} from '~/lib/theme/sizing';
import { cn } from '~/lib/utils';

import { type DocsSurface } from '../docs/kit/blocks';
import {
  DEFAULT_TOKEN_GLOBALS,
  formatToken,
  sizingGlobals,
  TOKEN_GROUPS,
  type TunableToken,
  tokenCss,
  tokenValue,
} from '../docs/kit/tokens';

/**
 * The sizing theme: a named style, or `null` once density or radius moved away from it. A density is a name, or a
 * factor for `scaleDensity`.
 */
interface SizingChoice {
  readonly style: SizingStyle | null;
  readonly density: Density | number;
  readonly radius: Radius;
}

/** The brand, the sizing theme and the token scales every page renders with; what the Customize menu tunes. */
interface Customization {
  readonly branding: BrandingTheme;
  readonly sizing: SizingChoice;
  /** Only the tokens moved away from the sizing theme's value, so a slider never pins a theme's token. */
  readonly tokens: Readonly<Record<string, number>>;
  /** The surface the examples sit on: chosen in the Customize menu. */
  readonly surface: DocsSurface;
  /** The sans font every page renders with: swaps `--font-sans`. */
  readonly font: Font;
}

const SURFACES: ReadonlyArray<DocsSurface> = ['page', 'card', 'popup'];

type Font = 'inter' | 'geist' | 'cal-sans';
const FONTS: ReadonlyArray<Font> = ['inter', 'geist', 'cal-sans'];
/** Faces in `site/styles.css`; Inter is the design system's own (`--font-sans` in `tailwind.css`). */
const FONT_FAMILIES: Record<Font, { readonly label: string; readonly family: string }> = {
  inter: { label: 'Inter', family: "'Inter Variable', sans-serif" },
  geist: { label: 'Geist', family: "'Geist', sans-serif" },
  'cal-sans': { label: 'Cal Sans', family: "'Cal Sans', sans-serif" },
};

const SIZING_STYLE_NAMES = Object.keys(SIZING_STYLES) as ReadonlyArray<SizingStyle>;
const DENSITY_NAMES = Object.keys(DENSITIES) as ReadonlyArray<Density>;
const RADIUS_NAMES = Object.keys(RADII) as ReadonlyArray<Radius>;
const STYLE_LABELS: Record<SizingStyle, string> = { triargos: 'Triargos', coss: 'Coss', dense: 'Dense', soft: 'Soft' };

/** A named style as a choice: its density and radius. */
const styleChoice = (style: SizingStyle): SizingChoice => ({
  style,
  density: SIZING_STYLES[style].density,
  radius: SIZING_STYLES[style].radius,
});

/** Density and radius alone: `triargos` when both are the default, else no style. */
const axesChoice = (density: Density | number, radius: Radius): SizingChoice =>
  density === 'default' && radius === 'default' ? styleChoice('triargos') : { style: null, density, radius };

const sizingTheme = ({ style, density, radius }: SizingChoice): SizingTheme =>
  style === null
    ? { density: typeof density === 'number' ? scaleDensity(density) : density, radius }
    : SIZING_STYLES[style];

/** The Scale slider's range: a factor for `scaleDensity`. */
const SCALE = { min: 0.8, max: 1.25, step: 0.025 } as const;

/** A stored scale factor in range, else a density name. */
const densityOf = (value: unknown): Density | number =>
  typeof value === 'number' && value >= SCALE.min && value <= SCALE.max && value !== 1
    ? value
    : oneOf(DENSITY_NAMES, value, 'default');

/** Every tunable token at the sizing theme's value (desktop), before the panel's own moves. */
const themeGlobals = (sizing: SizingChoice): Record<string, number> => ({
  ...DEFAULT_TOKEN_GLOBALS,
  ...sizingGlobals(sizingValues(sizingTheme(sizing)).base),
});

/** Every tunable token as the pages render it: the sizing theme's value, or the panel's. */
export const tokenGlobals = (customization: Customization): Record<string, number> => ({
  ...themeGlobals(customization.sizing),
  ...customization.tokens,
});

const DEFAULT: Customization = {
  branding: DEFAULT_BRANDING_THEME,
  sizing: styleChoice('triargos'),
  tokens: {},
  surface: 'page',
  font: 'inter',
};
const KEY = 'customization';
const CHANGE = 'customizationchange';

const oneOf = <A extends string>(literals: ReadonlyArray<A>, value: unknown, fallback: A): A =>
  literals.find((literal) => literal === value) ?? fallback;

/** Parsed once per stored string, so `useSyncExternalStore` sees a stable snapshot. */
let cache: { readonly raw: string | null; readonly value: Customization } = { raw: null, value: DEFAULT };

const read = (): Customization => {
  const raw = window.localStorage.getItem(KEY);
  if (raw === cache.raw) return cache.value;
  let stored: Partial<{
    branding: Partial<Record<keyof BrandingTheme, unknown>>;
    sizing: Partial<Record<keyof SizingChoice, unknown>>;
    tokens: Record<string, unknown>;
    surface: unknown;
    font: unknown;
  }> = {};
  try {
    stored = raw === null ? {} : JSON.parse(raw);
  } catch {
    // A broken entry falls back to the defaults.
  }
  const style = stored.sizing?.style === null ? null : oneOf(SIZING_STYLE_NAMES, stored.sizing?.style, 'triargos');
  const sizing =
    style === null
      ? axesChoice(densityOf(stored.sizing?.density), oneOf(RADIUS_NAMES, stored.sizing?.radius, 'default'))
      : styleChoice(style);
  const baseline = themeGlobals(sizing);
  const value: Customization = {
    branding: {
      primaryColor: oneOf(BRAND_PRIMARY_COLORS, stored.branding?.primaryColor, DEFAULT.branding.primaryColor),
      baseColor: oneOf(BRAND_BASE_COLORS, stored.branding?.baseColor, DEFAULT.branding.baseColor),
      destructiveColor: oneOf(
        BRAND_DESTRUCTIVE_COLORS,
        stored.branding?.destructiveColor,
        DEFAULT.branding.destructiveColor,
      ),
    },
    sizing,
    // Only values that differ from the theme's: an entry left at the theme's value would pin it.
    tokens: Object.fromEntries(
      TOKEN_GROUPS.flatMap((group) => group.tokens).flatMap((token) => {
        const tuned = tokenValue(stored.tokens ?? {}, token);
        return tuned === baseline[token.global] || stored.tokens?.[token.global] === undefined
          ? []
          : [[token.global, tuned]];
      }),
    ),
    surface: oneOf(SURFACES, stored.surface, DEFAULT.surface),
    font: oneOf(FONTS, stored.font, DEFAULT.font),
  };
  cache = { raw, value };
  return value;
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener('storage', onChange);
  };
};

const write = (next: Customization | null) => {
  if (next === null) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE));
};

/** Prerendered with the defaults; the stored choice applies after hydration. */
export const useCustomization = () => useSyncExternalStore(subscribe, read, () => DEFAULT);

/** The theme, sizing and token CSS, after `tailwind.css` so it wins; the panel's tokens last, over the sizing theme. */
export function CustomizationStyles() {
  const { branding, sizing, tokens, font } = useCustomization();
  return (
    <>
      <style data-branding>{brandingThemeCss(branding)}</style>
      <style data-sizing>{sizingThemeCss(sizingTheme(sizing))}</style>
      <style data-tokens>{tokenCss(tokens)}</style>
      {font !== DEFAULT.font && <style data-font>{`:root{--font-sans:${FONT_FAMILIES[font].family};}`}</style>}
    </>
  );
}

function Swatches<A extends BrandColor>({
  legend,
  name,
  colors,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  colors: ReadonlyArray<A>;
  value: A;
  onChange: (color: A) => void;
}) {
  return (
    <fieldset className='flex flex-col gap-related'>
      <legend className='mb-related flex w-full items-baseline justify-between text-body font-medium'>
        {legend}
        <span className='text-caption font-normal text-muted-foreground capitalize'>{value}</span>
      </legend>
      <div className='flex flex-wrap gap-1.5'>
        {colors.map((color) => (
          <label
            key={color}
            title={color}
            style={{ backgroundColor: toCss('LCH', BRAND_ANCHORS[color]) }}
            className={cn(
              'relative size-7 cursor-pointer rounded-full ring-1 ring-black/10 ring-inset dark:ring-white/10',
              'outline-offset-2 has-checked:outline-2 has-checked:outline-foreground has-focus-visible:outline-2 has-focus-visible:outline-ring',
            )}>
            <input
              type='radio'
              name={name}
              value={color}
              checked={color === value}
              onChange={() => onChange(color)}
              className='sr-only'
            />
            <span className='sr-only'>{color}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TokenSlider({
  token,
  value,
  baseline,
  onChange,
}: {
  token: TunableToken;
  value: number;
  /** The sizing theme's value: the slider reads as changed away from it. */
  baseline: number;
  onChange: (value: number) => void;
}) {
  const changed = value !== baseline;
  // A `full` value sits one step past `max`.
  const full = token.full;
  const position = full !== undefined && value === full ? token.max + token.step : value;
  return (
    <div className='flex flex-col gap-tight'>
      <div className='flex items-baseline justify-between text-caption'>
        <span className='text-foreground capitalize'>{token.label}</span>
        <span className={cn('tabular-nums', changed ? 'text-foreground' : 'text-muted-foreground')}>
          {formatToken(token, value)}
        </span>
      </div>
      <Slider
        aria-label={token.label}
        min={token.min}
        max={full === undefined ? token.max : token.max + token.step}
        step={token.step}
        value={position}
        onValueChange={(next) => onChange(full !== undefined && next > token.max ? full : next)}
      />
    </div>
  );
}

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
const CORNERS: ReadonlyArray<Corner> = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const CORNER_KEY = 'customize-corner';

/** Where the button rests: inset from the viewport edge, clear of the page panel's rounded corner. */
const CORNER_CLASSES: Record<Corner, string> = {
  'top-left': 'top-5 left-5',
  'top-right': 'top-5 right-5',
  'bottom-left': 'bottom-5 left-5',
  'bottom-right': 'bottom-5 right-5',
};

/** How far a flick carries the release point (s): a fast throw toward a corner lands there. */
const PROJECTION = 0.2;
const snapTransition = { type: 'spring', duration: 0.4, bounce: 0.2 } as const;

/** The corner nearest to where the button would come to rest: its centre plus the projected flick. */
const cornerAt = (rect: DOMRect, velocity: PanInfo['velocity']): Corner => {
  const x = rect.left + rect.width / 2 + velocity.x * PROJECTION;
  const y = rect.top + rect.height / 2 + velocity.y * PROJECTION;
  return `${y < window.innerHeight / 2 ? 'top' : 'bottom'}-${x < window.innerWidth / 2 ? 'left' : 'right'}`;
};

/**
 * Customize as a floating button, like the Next.js dev indicator: drag it to any corner (a flick carries it), click it
 * to open the surface, font, brand colors and token scales in a popover beside it. Choices and corner are saved in this
 * browser. At the app root.
 *
 * The button rests at its corner through CSS, so it prerenders in place. A drag moves it by `x`/`y`; on release it takes
 * the new corner and springs from where it was let go (FLIP), keeping the flick's velocity.
 */
export function CustomizeMenu() {
  const customization = useCustomization();
  const { branding, sizing, tokens } = customization;
  const baseline = themeGlobals(sizing);
  const globals = tokenGlobals(customization);
  const setBranding = (next: Partial<BrandingTheme>) => write({ ...customization, branding: { ...branding, ...next } });
  const setSizing = (next: SizingChoice) => {
    // Moves that land on the new theme's value are no longer moves.
    const nextBaseline = themeGlobals(next);
    const kept = Object.entries(tokens).filter(([name, value]) => nextBaseline[name] !== value);
    write({ ...customization, sizing: next, tokens: Object.fromEntries(kept) });
  };
  const setToken = (token: TunableToken, value: number) => {
    const { [token.global]: _, ...rest } = tokens;
    write({ ...customization, tokens: value === baseline[token.global] ? rest : { ...rest, [token.global]: value } });
  };
  const customized = JSON.stringify(customization) !== JSON.stringify(DEFAULT);

  const [open, setOpen] = useState(false);
  const [corner, setCorner] = useState<Corner>('bottom-right');
  const reduceMotion = useReducedMotion();
  const button = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  /** Set from drag start until the next press: the click that ends a drag must not open the menu. */
  const dragged = useRef(false);
  /** Where the button was let go, kept across the render that moves it to its new corner. */
  const release = useRef<{ left: number; top: number; velocity: PanInfo['velocity'] } | null>(null);

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(CORNER_KEY);
    setCorner(CORNERS.find((c) => c === stored) ?? 'bottom-right');
  }, []);

  const settle = () => {
    const from = release.current;
    const el = button.current;
    release.current = null;
    if (!from || !el) return;
    x.set(0);
    y.set(0);
    const rest = el.getBoundingClientRect();
    x.set(from.left - rest.left);
    y.set(from.top - rest.top);
    if (reduceMotion) {
      x.set(0);
      y.set(0);
      return;
    }
    animate(x, 0, { ...snapTransition, velocity: from.velocity.x });
    animate(y, 0, { ...snapTransition, velocity: from.velocity.y });
  };

  // After the corner changes, the button sits at the new corner with the drag offset still applied; settle it.
  useLayoutEffect(settle, [corner]);

  const onDragEnd = (_: PointerEvent, info: PanInfo) => {
    const el = button.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    release.current = { left: rect.left, top: rect.top, velocity: info.velocity };
    const next = cornerAt(rect, info.velocity);
    if (next === corner) settle();
    else {
      window.localStorage.setItem(CORNER_KEY, next);
      setCorner(next);
    }
  };

  const [vertical, horizontal] = corner.split('-') as ['top' | 'bottom', 'left' | 'right'];

  return (
    <Popover
      open={open}
      onOpenChange={(next, details) => {
        if (next && details.reason === 'trigger-press' && dragged.current) return;
        setOpen(next);
      }}>
      <motion.div
        ref={button}
        drag
        dragMomentum={false}
        onPointerDownCapture={() => (dragged.current = false)}
        onDragStart={() => {
          dragged.current = true;
          setOpen(false);
        }}
        onDragEnd={onDragEnd}
        style={{ x, y }}
        className={cn('fixed z-40 touch-none', CORNER_CLASSES[corner])}>
        <PopoverTrigger
          aria-label='Customize'
          className={cn(
            'relative flex size-10 cursor-grab items-center justify-center rounded-full bg-neutral-solid text-neutral-solid-foreground shadow-popup outline-none active:cursor-grabbing',
            'transition-transform duration-feedback ease-out focus-visible:ring-3 focus-visible:ring-ring/24 active:scale-96 motion-reduce:transition-none',
            'data-popup-open:scale-96',
          )}>
          <IconAdjustmentsHorizontal aria-hidden className='size-4' />
          {customized && (
            <span
              aria-label='(changed)'
              className='absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary-solid ring-2 ring-background'
            />
          )}
        </PopoverTrigger>
      </motion.div>
      <PopoverContent
        side={vertical === 'top' ? 'bottom' : 'top'}
        align={horizontal === 'left' ? 'start' : 'end'}
        sideOffset={10}
        className='max-h-[min(var(--available-height),40rem)] w-[min(20rem,calc(100vw-2.5rem))] gap-0 p-0'>
        <PopoverHeader className='px-group pt-group pb-related'>
          <PopoverTitle>Customize</PopoverTitle>
          <PopoverDescription>
            Surface, font, brand colors, sizing and token scales for every page. Saved in this browser.
          </PopoverDescription>
        </PopoverHeader>
        <div className='flex min-h-0 flex-1 flex-col gap-group overflow-y-auto px-group py-related'>
          <div role='group' aria-labelledby='examples-on' className='flex flex-col gap-related'>
            <span id='examples-on' className='text-body font-medium'>
              Examples on
            </span>
            <TabsRadioGroup
              variant='segmented'
              aria-labelledby='examples-on'
              value={customization.surface}
              onValueChange={(surface) => write({ ...customization, surface: surface as DocsSurface })}
              className='w-full'>
              {SURFACES.map((surface) => (
                <TabsRadio key={surface} value={surface} className='flex-1 capitalize'>
                  {surface}
                </TabsRadio>
              ))}
            </TabsRadioGroup>
          </div>
          <div role='group' aria-labelledby='font' className='flex flex-col gap-related'>
            <span id='font' className='text-body font-medium'>
              Font
            </span>
            <TabsRadioGroup
              variant='segmented'
              aria-labelledby='font'
              value={customization.font}
              onValueChange={(font) => write({ ...customization, font: font as Font })}
              className='w-full'>
              {FONTS.map((font) => (
                <TabsRadio
                  key={font}
                  value={font}
                  style={{ fontFamily: FONT_FAMILIES[font].family }}
                  className='flex-1'>
                  {FONT_FAMILIES[font].label}
                </TabsRadio>
              ))}
            </TabsRadioGroup>
          </div>
          <div role='group' aria-labelledby='sizing-style' className='flex flex-col gap-related'>
            <span id='sizing-style' className='flex items-baseline justify-between text-body font-medium'>
              Style
              {sizing.style === null && <span className='text-caption font-normal text-muted-foreground'>Custom</span>}
            </span>
            <TabsRadioGroup
              variant='segmented'
              aria-labelledby='sizing-style'
              value={sizing.style ?? ''}
              onValueChange={(style) => {
                setSizing(styleChoice(oneOf(SIZING_STYLE_NAMES, style, 'triargos')));
              }}
              className='w-full'>
              {SIZING_STYLE_NAMES.map((style) => (
                <TabsRadio key={style} value={style} className='flex-1'>
                  {STYLE_LABELS[style]}
                </TabsRadio>
              ))}
            </TabsRadioGroup>
          </div>
          <div role='group' aria-labelledby='sizing-density' className='flex flex-col gap-related'>
            <span id='sizing-density' className='text-body font-medium'>
              Density
            </span>
            <TabsRadioGroup
              variant='segmented'
              aria-labelledby='sizing-density'
              value={typeof sizing.density === 'string' ? sizing.density : ''}
              onValueChange={(density) =>
                setSizing(axesChoice(oneOf(DENSITY_NAMES, density, 'default'), sizing.radius))
              }
              className='w-full'>
              {DENSITY_NAMES.map((density) => (
                <TabsRadio key={density} value={density} className='flex-1 capitalize'>
                  {density}
                </TabsRadio>
              ))}
            </TabsRadioGroup>
            <div className='flex items-baseline justify-between text-caption'>
              <span className='text-foreground'>Scale</span>
              <span
                className={cn(
                  'tabular-nums',
                  typeof sizing.density === 'number' ? 'text-foreground' : 'text-muted-foreground',
                )}>
                {typeof sizing.density === 'number' ? `×${sizing.density.toFixed(3)}` : '×1 (named)'}
              </span>
            </div>
            <Slider
              aria-label='Scale'
              min={SCALE.min}
              max={SCALE.max}
              step={SCALE.step}
              value={typeof sizing.density === 'number' ? sizing.density : 1}
              onValueChange={(scale) => {
                // Snap away float noise from the step arithmetic.
                const factor = Math.round(scale * 1000) / 1000;
                setSizing(axesChoice(factor === 1 ? 'default' : factor, sizing.radius));
              }}
            />
          </div>
          <div role='group' aria-labelledby='sizing-radius' className='flex flex-col gap-related'>
            <span id='sizing-radius' className='text-body font-medium'>
              Radius
            </span>
            <TabsRadioGroup
              variant='segmented'
              aria-labelledby='sizing-radius'
              value={sizing.radius}
              onValueChange={(radius) => setSizing(axesChoice(sizing.density, oneOf(RADIUS_NAMES, radius, 'default')))}
              className='w-full'>
              {RADIUS_NAMES.map((radius) => (
                <TabsRadio key={radius} value={radius} className='flex-1 capitalize'>
                  {radius}
                </TabsRadio>
              ))}
            </TabsRadioGroup>
          </div>
          <Swatches
            legend='Primary'
            name='primary'
            colors={BRAND_PRIMARY_COLORS}
            value={branding.primaryColor}
            onChange={(primaryColor) => setBranding({ primaryColor })}
          />
          <Swatches
            legend='Base'
            name='base'
            colors={BRAND_BASE_COLORS}
            value={branding.baseColor}
            onChange={(baseColor) => setBranding({ baseColor })}
          />
          <Swatches
            legend='Destructive'
            name='destructive'
            colors={BRAND_DESTRUCTIVE_COLORS}
            value={branding.destructiveColor}
            onChange={(destructiveColor) => setBranding({ destructiveColor })}
          />
          <Accordion>
            {TOKEN_GROUPS.map((group) => (
              <AccordionItem key={group.title} value={group.title}>
                <AccordionTrigger>{group.title}</AccordionTrigger>
                <AccordionContent className='flex flex-col gap-group'>
                  {group.tokens.map((token) => (
                    <TokenSlider
                      key={token.global}
                      token={token}
                      value={tokenValue(globals, token)}
                      baseline={tokenValue(baseline, token)}
                      onChange={(value) => setToken(token, value)}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className='border-t border-border-subtle p-related'>
          <Button className='w-full' disabled={!customized} onClick={() => write(null)}>
            <IconRotate data-icon='inline-start' aria-hidden />
            Reset to defaults
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

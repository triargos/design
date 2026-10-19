import { RotateCcwIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { SidebarMenuButton } from '~/components/ui/sidebar';
import { Slider } from '~/components/ui/slider';

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
import { cn } from '~/lib/utils';

import {
  DEFAULT_TOKEN_GLOBALS,
  formatToken,
  TOKEN_GROUPS,
  type TunableToken,
  tokenCss,
  tokenValue,
} from '../storybook/kit/tokens';

/** The brand and the token scales every page renders with; what Storybook's toolbar and Tokens panel tune. */
interface Customization {
  readonly branding: BrandingTheme;
  readonly tokens: Readonly<Record<string, number>>;
}

const DEFAULT: Customization = { branding: DEFAULT_BRANDING_THEME, tokens: DEFAULT_TOKEN_GLOBALS };
const KEY = 'customization';
const CHANGE = 'customizationchange';

const oneOf = <A extends string>(literals: ReadonlyArray<A>, value: unknown, fallback: A): A =>
  literals.find((literal) => literal === value) ?? fallback;

/** Parsed once per stored string, so `useSyncExternalStore` sees a stable snapshot. */
let cache: { readonly raw: string | null; readonly value: Customization } = { raw: null, value: DEFAULT };

const read = (): Customization => {
  const raw = window.localStorage.getItem(KEY);
  if (raw === cache.raw) return cache.value;
  let stored: Partial<{ branding: Partial<Record<keyof BrandingTheme, unknown>>; tokens: Record<string, unknown> }> =
    {};
  try {
    stored = raw === null ? {} : JSON.parse(raw);
  } catch {
    // A broken entry falls back to the defaults.
  }
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
    tokens: Object.fromEntries(
      TOKEN_GROUPS.flatMap((group) => group.tokens).map((token) => [
        token.global,
        tokenValue(stored.tokens ?? {}, token),
      ]),
    ),
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
const useCustomization = () => useSyncExternalStore(subscribe, read, () => DEFAULT);

/** The theme and token CSS, after `tailwind.css` so it wins. */
export function CustomizationStyles() {
  const { branding, tokens } = useCustomization();
  return (
    <>
      <style data-branding>{brandingThemeCss(branding)}</style>
      <style data-tokens>{tokenCss(tokens)}</style>
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
  onChange,
}: {
  token: TunableToken;
  value: number;
  onChange: (value: number) => void;
}) {
  const changed = value !== token.defaultValue;
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
        max={token.max}
        step={token.step}
        value={value}
        onValueChange={(next) => onChange(next)}
      />
    </div>
  );
}

/** "Customize" in the sidebar: a sheet with the brand colors and the token scales, saved in this browser. */
export function Customize() {
  const customization = useCustomization();
  const { branding, tokens } = customization;
  const setBranding = (next: Partial<BrandingTheme>) => write({ ...customization, branding: { ...branding, ...next } });
  const setToken = (token: TunableToken, value: number) =>
    write({ ...customization, tokens: { ...tokens, [token.global]: value } });
  const customized = JSON.stringify(customization) !== JSON.stringify(DEFAULT);

  return (
    <Sheet>
      <SheetTrigger render={<SidebarMenuButton />}>
        <SlidersHorizontalIcon aria-hidden />
        Customize
        {customized && <span aria-label='(changed)' className='ms-auto size-1.5 rounded-full bg-primary-solid' />}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Customize</SheetTitle>
          <SheetDescription>Brand colors and token scales for every page. Saved in this browser.</SheetDescription>
        </SheetHeader>
        <SheetBody className='flex flex-col gap-page'>
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
                      value={tokenValue(tokens, token)}
                      onChange={(value) => setToken(token, value)}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SheetBody>
        <SheetFooter>
          <Button type='button' intent='neutral' emphasis='raised' disabled={!customized} onClick={() => write(null)}>
            <RotateCcwIcon data-icon='inline-start' aria-hidden />
            Reset to defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

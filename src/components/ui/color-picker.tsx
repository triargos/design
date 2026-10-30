import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { type CSSProperties, type PointerEvent, useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';

import { InputGroup, InputGroupAddon } from '~/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { RadioGroup } from '~/components/ui/radio-group';

import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

/** A swatch: a CSS color and its name. */
export interface ColorPreset {
  readonly value: string;
  readonly label: string;
}

/** Tailwind 500s: they read as a 6px dot and as an icon stroke on light and dark surfaces. */
const DEFAULT_PRESETS: ReadonlyArray<ColorPreset> = [
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

const CUSTOM_GRADIENT = 'conic-gradient(#ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)';

const swatchStyle = (color: string): CSSProperties => ({ '--swatch': color }) as CSSProperties;

/** Fill scale per state; selected leaves a gap inside the 2px ring (4px on a 32px swatch). */
const FILL_SCALE = { rest: 1, hover: 0.92, press: 0.84, checked: 0.625, checkedPress: 0.58 } as const;

/** Mouse hover and press for the fill's scale; touch skips hover, so a tap does not leave it shrunk. */
function useSwatchPointer() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const release = () => setPressed(false);
  return {
    hovered,
    pressed,
    handlers: {
      onPointerEnter: (event: PointerEvent) => setHovered(event.pointerType === 'mouse'),
      onPointerLeave: () => {
        setHovered(false);
        setPressed(false);
      },
      onPointerDown: () => setPressed(true),
      onPointerUp: release,
      onPointerCancel: release,
    },
  };
}

function SwatchFill({
  checked,
  hovered,
  pressed,
  style,
}: {
  checked: boolean;
  hovered: boolean;
  pressed: boolean;
  style: CSSProperties;
}) {
  const scale = checked
    ? pressed
      ? FILL_SCALE.checkedPress
      : FILL_SCALE.checked
    : pressed
      ? FILL_SCALE.press
      : hovered
        ? FILL_SCALE.hover
        : FILL_SCALE.rest;
  return (
    <span
      aria-hidden
      // A faint ring, so a light color still reads on a light surface.
      className='size-full rounded-full inset-ring inset-ring-black/10 transition-[scale] duration-indicator ease-spring-bounce motion-reduce:transition-none dark:inset-ring-white/12'
      style={{ ...style, scale: String(scale) }}
    />
  );
}

function PresetSwatch({ color, checked, label }: { color: string; checked: boolean; label: string }) {
  const { hovered, pressed, handlers } = useSwatchPointer();
  return (
    <RadioPrimitive.Root
      value={color}
      aria-label={label}
      title={label}
      // Selected: the fill shrinks inside a ring of the same color, so the gap works on any surface. Hover only shrinks
      // the fill: a faint ring against the fill reads as a blurred edge.
      className={cn(
        'hit-area relative flex size-control-sm shrink-0 items-center justify-center rounded-full outline-none',
        'inset-ring-2 inset-ring-transparent transition-shadow duration-feedback data-checked:inset-ring-(--swatch)',
        'focus-visible:ring-3 focus-visible:ring-ring/24',
        'disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50',
      )}
      style={swatchStyle(color)}
      {...handlers}>
      <SwatchFill checked={checked} hovered={hovered} pressed={pressed} style={{ background: 'var(--swatch)' }} />
    </RadioPrimitive.Root>
  );
}

function CustomSwatch({ value, isCustom, label }: { value: string; isCustom: boolean; label: string }) {
  const { hovered, pressed, handlers } = useSwatchPointer();
  return (
    <PopoverTrigger
      render={
        <button
          type='button'
          data-checked={isCustom ? '' : undefined}
          aria-label={isCustom ? `${label}: ${value}` : label}
          title={label}
          className={cn(
            'hit-area relative flex size-control-sm shrink-0 items-center justify-center rounded-full outline-none',
            'inset-ring-2 inset-ring-transparent transition-shadow duration-feedback data-checked:inset-ring-(--swatch)',
            'focus-visible:ring-3 focus-visible:ring-ring/24',
            'disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50',
          )}
          style={swatchStyle(isCustom ? value : 'var(--foreground)')}
          {...handlers}
        />
      }>
      <SwatchFill
        checked={isCustom}
        hovered={hovered}
        pressed={pressed}
        style={{ background: isCustom ? 'var(--swatch)' : CUSTOM_GRADIENT }}
      />
    </PopoverTrigger>
  );
}

interface ColorPickerProps {
  /** A lowercase hex. */
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  /** The swatches, in order. Default: twelve Tailwind 500s. */
  readonly presets?: ReadonlyArray<ColorPreset>;
  /**
   * Any other color: `popover`, a last swatch opens the picker; `inline`, the picker sits under the swatches (for a
   * picker in a popup); `false`, the presets only.
   */
  readonly custom?: 'popover' | 'inline' | false;
  readonly 'aria-labelledby'?: string;
  /** The group's name without `aria-labelledby`. */
  readonly 'aria-label'?: string;
  /** The custom swatch's name; selected, it reads "Custom color: #d3d3d3". */
  readonly customLabel?: string;
  readonly hexLabel?: string;
}

/** A color chosen from swatches, or any color with `custom`. The value is a lowercase hex. */
function ColorPicker({
  value,
  onValueChange,
  presets = DEFAULT_PRESETS,
  custom = 'popover',
  'aria-labelledby': labelledBy,
  'aria-label': labelProp,
  customLabel: customLabelProp,
  hexLabel: hexLabelProp,
}: ColorPickerProps) {
  const { labels } = useLocale();
  const label = labelProp ?? labels.color;
  const customLabel = customLabelProp ?? labels.customColor;
  const hexLabel = hexLabelProp ?? labels.hexColor;
  const normalized = value.toLowerCase();
  const preset = presets.find((swatch) => swatch.value.toLowerCase() === normalized)?.value ?? null;

  const swatches = (
    <RadioGroup
      value={preset}
      onValueChange={onValueChange}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={cn(
        'flex flex-wrap gap-related pointer-coarse:gap-3',
        custom === 'inline' && 'grid grid-cols-6 justify-between gap-y-(--color-picker-row-gap)',
      )}>
      {presets.map((swatch) => (
        <PresetSwatch key={swatch.value} color={swatch.value} checked={preset === swatch.value} label={swatch.label} />
      ))}
      {custom === 'popover' && (
        <Popover>
          <CustomSwatch value={value} isCustom={preset === null} label={customLabel} />
          <PopoverContent align='start' className='w-60 p-picker [--outer-inset:var(--spacing-picker)]' sideOffset={8}>
            <CustomColor value={value} onValueChange={onValueChange} hexLabel={hexLabel} />
          </PopoverContent>
        </Popover>
      )}
    </RadioGroup>
  );

  if (custom !== 'inline') return swatches;

  return (
    <div className='flex flex-col gap-picker'>
      {swatches}
      <CustomColor value={value} onValueChange={onValueChange} hexLabel={hexLabel} />
    </div>
  );
}

/** The free choice: a saturation/hue area and a hex field that takes typed or pasted values. */
function CustomColor({
  value,
  onValueChange,
  hexLabel,
}: Pick<ColorPickerProps, 'value' | 'onValueChange'> & { hexLabel: string }) {
  return (
    <div className='flex flex-col gap-(--color-picker-row-gap)'>
      {/* react-colorful injects unlayered CSS, which beats layered utilities: overrides of its rules need `!`. */}
      <HexColorPicker
        color={value}
        onChange={onValueChange}
        className='[&>*:first-child]:rounded-inner! [&>*:first-child]:border-b-0! [&>*:last-child]:mt-picker [&>*:last-child]:h-(--color-picker-hue)! [&>*:last-child]:rounded-track!'
        style={{ width: '100%', height: 160 }}
      />
      <InputGroup>
        <InputGroupAddon>
          <span
            aria-hidden
            className='size-icon rounded-full inset-ring inset-ring-black/10 dark:inset-ring-white/12'
            style={{ background: value }}
          />
        </InputGroupAddon>
        <span
          data-slot='input-group-input'
          className='flex h-full min-w-0 flex-1 items-center px-[calc(var(--spacing-field-pad)-1px)] text-control max-md:text-[1rem]'>
          <HexColorInput
            data-slot='input-group-control'
            aria-label={hexLabel}
            prefixed
            color={value}
            onChange={(next) => onValueChange(next.toLowerCase())}
            className='h-full w-full min-w-0 flex-1 bg-transparent p-0 font-mono uppercase outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed'
          />
        </span>
      </InputGroup>
    </div>
  );
}

export { ColorPicker };

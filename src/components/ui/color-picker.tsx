import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { motion, type Transition, useReducedMotion } from 'framer-motion';
import { type CSSProperties, type PointerEvent, useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { useUiStrings } from '~/lib/ui-config';

import { inputControlClassName } from '~/components/ui/input';
import { InputGroup, InputGroupAddon } from '~/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { RadioGroup } from '~/components/ui/radio-group';

import { cn } from '~/lib/utils';

/**
 * Tailwind 500s: they read as a 6px dot and as a status-icon stroke on light and dark surfaces. The default submission
 * statuses use these values, so they show up as presets.
 */
const COLOR_PRESETS = [
  { name: 'gray', value: '#6b7280' },
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'amber', value: '#f59e0b' },
  { name: 'yellow', value: '#eab308' },
  { name: 'green', value: '#22c55e' },
  { name: 'teal', value: '#14b8a6' },
  { name: 'cyan', value: '#06b6d4' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'indigo', value: '#6366f1' },
  { name: 'violet', value: '#8b5cf6' },
  { name: 'pink', value: '#ec4899' },
] as const;

const DEFAULT_COLOR = COLOR_PRESETS[0].value;

const CUSTOM_GRADIENT = 'conic-gradient(#ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)';

const swatchStyle = (color: string): CSSProperties => ({ '--swatch': color }) as CSSProperties;

/**
 * Selected: the fill shrinks inside a ring of the same color, so the gap works on any surface. Hover only shrinks the
 * fill: a faint ring against the fill reads as a blurred edge.
 */
const swatchClassName = cn(
  'hit-area relative flex size-8 shrink-0 items-center justify-center rounded-full outline-none',
  'inset-ring-2 inset-ring-transparent transition-shadow duration-feedback',
  'data-checked:inset-ring-(--swatch)',
  'focus-visible:ring-3 focus-visible:ring-ring/24',
  'disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50',
);

/** The edge of a color dot: a faint ring, so a light color still reads on a light surface. */
const swatchEdge = 'rounded-full inset-ring inset-ring-black/10 dark:inset-ring-white/12';

/** Fill scale per state; selected leaves a 4px gap inside the 2px ring. */
const FILL_SCALE = { rest: 1, hover: 0.92, press: 0.84, checked: 0.625, checkedPress: 0.58 } as const;

/** Interruptible: hover in and out mid-flight retargets from the current scale. A small overshoot on settle. */
const fillSpring: Transition = { type: 'spring', visualDuration: 0.22, bounce: 0.35, restDelta: 0.001 };

/** Mouse hover and press for the fill's spring; touch skips hover, so a tap does not leave it shrunk. */
const useSwatchPointer = () => {
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
};

const SwatchFill = ({
  checked,
  hovered,
  pressed,
  style,
}: {
  checked: boolean;
  hovered: boolean;
  pressed: boolean;
  style: CSSProperties;
}) => {
  const reduceMotion = useReducedMotion();
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
    <motion.span
      aria-hidden
      className={cn('size-full', swatchEdge)}
      style={style}
      initial={false}
      animate={{ scale }}
      transition={reduceMotion ? { duration: 0 } : fillSpring}
    />
  );
};

const PresetSwatch = ({ color, checked, label }: { color: string; checked: boolean; label: string }) => {
  const { hovered, pressed, handlers } = useSwatchPointer();
  return (
    <RadioPrimitive.Root
      value={color}
      aria-label={label}
      title={label}
      className={swatchClassName}
      style={swatchStyle(color)}
      {...handlers}>
      <SwatchFill checked={checked} hovered={hovered} pressed={pressed} style={{ background: 'var(--swatch)' }} />
    </RadioPrimitive.Root>
  );
};

const CustomSwatch = ({ value, isCustom }: { value: string | undefined; isCustom: boolean }) => {
  const t = useUiStrings().colorPicker;
  const { hovered, pressed, handlers } = useSwatchPointer();
  return (
    <PopoverTrigger
      render={
        <button
          type='button'
          data-checked={isCustom ? '' : undefined}
          aria-label={isCustom ? t.customValue(value ?? '') : t.custom}
          title={t.custom}
          className={swatchClassName}
          style={swatchStyle(isCustom && value ? value : 'var(--foreground)')}
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
};

interface ColorPickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  /** `popover`: a custom swatch opens the picker. `inline`: the picker sits under the presets (inside a popover). */
  custom?: 'popover' | 'inline';
  'aria-labelledby'?: string;
}

export const ColorPicker = ({
  value,
  onChange,
  custom = 'popover',
  'aria-labelledby': labelledBy,
}: ColorPickerProps) => {
  const t = useUiStrings().colorPicker;
  const normalized = value?.toLowerCase();
  const preset = COLOR_PRESETS.find((color) => color.value === normalized);
  const isCustom = value !== undefined && !preset;

  const presets = (
    <RadioGroup
      value={preset?.value ?? null}
      onValueChange={onChange}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : t.label}
      className={cn(
        'flex flex-wrap gap-2 pointer-coarse:gap-3',
        custom === 'inline' && 'grid grid-cols-6 justify-between gap-y-2.5',
      )}>
      {COLOR_PRESETS.map((color) => (
        <PresetSwatch
          key={color.value}
          color={color.value}
          checked={preset?.value === color.value}
          label={t.colors[color.name] ?? color.name}
        />
      ))}
      {custom === 'popover' && (
        <Popover>
          <CustomSwatch value={value} isCustom={isCustom} />
          <PopoverContent align='start' className='w-60 p-3' sideOffset={8}>
            <CustomColor value={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
      )}
    </RadioGroup>
  );

  if (custom === 'popover') return presets;

  return (
    <div className='flex flex-col gap-3'>
      {presets}
      <CustomColor value={value} onChange={onChange} />
    </div>
  );
};

/** The free choice: a saturation/hue area and a hex field that takes typed or pasted values. */
const CustomColor = ({ value, onChange }: Pick<ColorPickerProps, 'value' | 'onChange'>) => {
  const t = useUiStrings().colorPicker;
  const color = value ?? DEFAULT_COLOR;

  return (
    <div className='flex flex-col gap-2.5'>
      {/* react-colorful injects unlayered CSS, which beats layered utilities: overrides of its rules need `!`. */}
      <HexColorPicker
        color={color}
        onChange={onChange}
        className='[&>*:first-child]:rounded-inner! [&>*:first-child]:border-b-0! [&>*:last-child]:mt-3 [&>*:last-child]:h-3! [&>*:last-child]:rounded-full!'
        style={{ width: '100%', height: 160 }}
      />
      <InputGroup>
        <InputGroupAddon>
          <span aria-hidden className={cn('size-4', swatchEdge)} style={{ background: color }} />
        </InputGroupAddon>
        <span data-slot='input-group-input' className='flex h-full min-w-0 flex-1 items-center px-3.5 text-control'>
          <HexColorInput
            data-slot='input-group-control'
            aria-label={t.hex}
            prefixed
            color={color}
            onChange={(next) => onChange(next.toLowerCase())}
            className={cn(inputControlClassName, 'font-mono uppercase')}
          />
        </span>
      </InputGroup>
    </div>
  );
};

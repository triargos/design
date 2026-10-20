import { AnimatePresence, motion, type Transition, useAnimate, useReducedMotion } from 'framer-motion';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

interface IntegerInputProps extends Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'onChange' | 'max' | 'maxLength' | 'className'
> {
  value: number;
  onValueChange: (value: number) => void;
  /** After the number: "days", "seats". */
  unit?: string;
  /** Stops "+" here and clamps what is typed. */
  max?: number;
  decrementLabel?: string;
  incrementLabel?: string;
  className?: string;
}

/** A held stepper repeats after this, then speeds up from `REPEAT_START_MS` to `REPEAT_MIN_MS`. */
const HOLD_DELAY_MS = 400;
const REPEAT_START_MS = 120;
const REPEAT_MIN_MS = 40;

/** A digit rolls one line on a short spring with a small settle; its fade has no bounce. */
const roll: Transition = {
  type: 'spring',
  visualDuration: 0.22,
  bounce: 0.2,
  opacity: { type: 'spring', visualDuration: 0.14, bounce: 0 },
};
const instant: Transition = { duration: 0 };

/** Up: the new digit comes in from below and the old one leaves through the top. Down: the reverse. */
const digitVariants = {
  enter: (direction: number) => ({ y: direction >= 0 ? '100%' : '-100%', opacity: 0 }),
  rest: { y: '0%', opacity: 1 },
  exit: (direction: number) => ({ y: direction >= 0 ? '-100%' : '100%', opacity: 0 }),
};

/** The number as the steppers show it: each place rolls on its own, so 19 → 20 turns both, 20 → 21 only the ones. */
function RollingNumber({ text, direction, transition }: { text: string; direction: number; transition: Transition }) {
  // Keyed by place from the right, so the ones stay put when a ten arrives.
  const places = [...text].reverse();
  return (
    <span aria-hidden className='pointer-events-none absolute inset-0 flex flex-row-reverse items-center justify-start'>
      <AnimatePresence initial={false} custom={direction} mode='popLayout'>
        {places.map((digit, place) => (
          <motion.span
            key={place}
            custom={direction}
            variants={digitVariants}
            initial='enter'
            animate='rest'
            exit='exit'
            transition={transition}
            className='grid'>
            <AnimatePresence initial={false} custom={direction}>
              <motion.span
                key={digit}
                custom={direction}
                variants={digitVariants}
                initial='enter'
                animate='rest'
                exit='exit'
                transition={transition}
                className='col-start-1 row-start-1'>
                {digit}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

/**
 * Press-and-hold for a stepper. A click steps once (pointer, keyboard and assistive tech alike); holding the pointer
 * past `HOLD_DELAY_MS` repeats, faster the longer it is held, until `step` returns false. The click that ends a hold is
 * swallowed.
 */
function useHoldToRepeat(step: () => boolean) {
  const stepRef = React.useRef(step);
  stepRef.current = step;
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const repeated = React.useRef(false);

  const stop = React.useCallback(() => clearTimeout(timer.current), []);
  React.useEffect(() => stop, [stop]);

  const start = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    repeated.current = false;
    stop();
    const tick = (delay: number, next: number) => {
      timer.current = setTimeout(() => {
        repeated.current = true;
        if (stepRef.current()) tick(next, Math.max(REPEAT_MIN_MS, next * 0.85));
      }, delay);
    };
    tick(HOLD_DELAY_MS, REPEAT_START_MS);
    // On the window: the pointer may leave the button before it lets go.
    const end = () => {
      stop();
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  return {
    onPointerDown: start,
    onClick: () => {
      if (repeated.current) repeated.current = false;
      else stepRef.current();
    },
    // A long press on Android opens the context menu, which cancels the hold.
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  };
}

/**
 * A non-negative whole number between a minus and a plus. The steppers sit outside the field, so a tap on the number
 * never lands on one. Steps roll the digits; typing and arrow keys change them in place. Hold a stepper to repeat; a
 * press past a limit, or a typed number over `max`, shakes the number.
 * Focus selects the number, and the first key replaces it even where the browser drops the selection (iOS). A cleared
 * field reads as 0.
 */
function IntegerInput({
  value,
  onValueChange,
  unit,
  max,
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
  disabled,
  onFocus,
  onBlur,
  onKeyDown,
  className,
  ...props
}: IntegerInputProps) {
  const reduced = useReducedMotion() ?? false;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [shakeScope, animate] = useAnimate<HTMLSpanElement>();

  // The text while the field has focus: it may be empty, or the caret may sit inside it.
  const [draft, setDraft] = React.useState<string | null>(null);
  // Set on focus: the next key replaces the whole number.
  const replaceNext = React.useRef(false);

  // Which way the last change went, for the roll.
  const [previous, setPrevious] = React.useState(value);
  const [direction, setDirection] = React.useState(0);
  if (value !== previous) {
    setPrevious(value);
    setDirection(Math.sign(value - previous));
  }

  const valueRef = React.useRef(value);
  valueRef.current = value;

  const clamp = (n: number) => Math.max(0, max === undefined ? n : Math.min(n, max));

  /** A refused step or digit: the number shakes once. */
  const reject = () => {
    if (reduced || !shakeScope.current) return;
    void animate(shakeScope.current, { x: [0, -3, 3, 0] }, { duration: 0.2, ease: [0.23, 1, 0.32, 1] });
  };

  /** Steps by `delta`; false at the limit, which ends a hold. */
  const step = (delta: number) => {
    const next = clamp(valueRef.current + delta);
    if (next === valueRef.current) {
      reject();
      return false;
    }
    valueRef.current = next;
    onValueChange(next);
    return true;
  };

  const decrement = useHoldToRepeat(() => step(-1));
  const increment = useHoldToRepeat(() => step(1));

  const editing = draft !== null;
  const text = draft ?? String(value);
  const atMin = value <= 0;
  const atMax = max !== undefined && value >= max;

  return (
    <div data-slot='integer-input' role='group' className={cn('flex w-full min-w-0 items-center gap-1.5', className)}>
      {/* At a limit the stepper stays pressable, its icon dimmed, so a press there can shake the number. */}
      <Button
        size='icon'
        aria-label={decrementLabel}
        disabled={disabled}
        aria-disabled={(!disabled && atMin) || undefined}
        className='[-webkit-touch-callout:none] aria-disabled:text-disabled-foreground'
        {...decrement}>
        <IconMinus />
      </Button>
      <div
        data-slot='integer-input-field'
        // A press anywhere on the field (the unit, the space around the number) focuses the number.
        onPointerDown={(event) => {
          if (event.target === inputRef.current) return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
        className={cn(
          inputSurfaceVariants({ scope: 'group' }),
          'flex h-9 min-w-0 flex-1 cursor-text items-center justify-center gap-1.5 px-3 text-control max-sm:text-[1rem]',
        )}>
        <span ref={shakeScope} className='flex h-full items-center gap-1.5'>
          {/* As wide as its digits, so number and unit center together as one line of text. Clipped top and bottom at
              the field's edge, where the rolling digits come and go. */}
          <motion.span
            className='relative h-full overflow-clip font-medium tabular-nums'
            initial={false}
            animate={{ width: `${Math.max(1, text.length)}ch` }}
            transition={editing || reduced ? instant : roll}>
            <input
              ref={inputRef}
              data-slot='input-group-control'
              // Text, not number: React leaves a number input alone while its text parses to the same value, so
              // typing 1 after 0 would stay "01".
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              autoComplete='off'
              role='spinbutton'
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuetext={unit ? `${value} ${unit}` : undefined}
              value={text}
              disabled={disabled}
              onFocus={(event) => {
                setDraft(String(value));
                replaceNext.current = true;
                // After the tap has placed its caret: iOS drops a selection made during focus.
                const input = event.currentTarget;
                setTimeout(() => {
                  if (document.activeElement === input) input.setSelectionRange(0, input.value.length);
                });
                onFocus?.(event);
              }}
              onBlur={(event) => {
                setDraft(null);
                replaceNext.current = false;
                onBlur?.(event);
              }}
              // A second tap places the caret on purpose: keys then edit in place.
              onPointerDown={(event) => {
                if (document.activeElement === event.currentTarget) replaceNext.current = false;
              }}
              onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.defaultPrevented) return;
                if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                event.preventDefault();
                replaceNext.current = false;
                const before = valueRef.current;
                step(event.key === 'ArrowUp' ? 1 : -1);
                if (valueRef.current !== before) setDraft(String(valueRef.current));
              }}
              onChange={(event) => {
                const { inputType, data } = event.nativeEvent as InputEvent;
                let typed = event.target.value;
                // The first key after focus replaces the number, selected or not.
                if (replaceNext.current) {
                  if (inputType === 'insertText' && data) typed = data;
                  else if (inputType.startsWith('delete')) typed = '';
                }
                replaceNext.current = false;
                const digits = typed.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                if (digits === '') {
                  setDraft('');
                  // Never `undefined`: a form library may answer that with the default value, so the last digit
                  // could not be deleted.
                  if (value !== 0) onValueChange(0);
                  return;
                }
                const next = clamp(Number(digits));
                if (next !== Number(digits)) reject();
                setDraft(String(next));
                if (next !== value) onValueChange(next);
              }}
              className={cn(
                'h-full w-full bg-transparent p-0 text-right outline-none disabled:cursor-not-allowed',
                // Not editing, the rolling copy draws the digits on top; the input keeps the place and the caret.
                !editing && 'text-transparent',
              )}
              {...props}
            />
            {!editing && <RollingNumber text={text} direction={direction} transition={reduced ? instant : roll} />}
          </motion.span>
          {unit && <span className='text-muted-foreground select-none'>{unit}</span>}
        </span>
      </div>
      <Button
        size='icon'
        aria-label={incrementLabel}
        disabled={disabled}
        aria-disabled={(!disabled && atMax) || undefined}
        className='[-webkit-touch-callout:none] aria-disabled:text-disabled-foreground'
        {...increment}>
        <IconPlus />
      </Button>
    </div>
  );
}

export { IntegerInput };

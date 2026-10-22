import { OTPField as OTPFieldPrimitive } from '@base-ui/react/otp-field';
import * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

/** Odd and even run the same keyframes, so each new entry restarts the animation (as the toast upsert does). */
type Parity = 'odd' | 'even';

const flip = (parity: Parity | undefined): Parity => (parity === 'odd' ? 'even' : 'odd');

interface InputOTPContextValue {
  invalid: boolean;
  /** The slots the last typed, pasted or autofilled input wrote; more than one fill in sequence. */
  entry: { from: number; to: number; parity: Parity } | null;
  /** The slot that just refused a character. */
  rejected: { index: number; parity: Parity } | null;
  slotLabel: SlotLabel;
}

type SlotLabel = (slot: { readonly position: number; readonly length: number }) => string;

const InputOTPContext = React.createContext<InputOTPContextValue>({
  invalid: false,
  entry: null,
  rejected: null,
  slotLabel: ({ position, length }) => `Character ${position} of ${length}`,
});

const slotSelector = 'input[data-slot=input-otp-slot]';

type InputOTPProps = Omit<OTPFieldPrimitive.Root.Props, 'className' | 'ref'> & {
  className?: string;
  /** Marks the slots invalid and shakes the row once as it turns invalid. Incomplete: only the empty slots. */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** `focus()` moves to the first empty slot, or the last; pass react-hook-form's `field.ref`. */
  ref?: React.Ref<{ focus: () => void }>;
  /** The accessible name of every slot but the first, which the field's label names. */
  slotLabel?: SlotLabel;
};

/**
 * A one-time code, one real `<input>` per character (Base UI OTP Field). Numeric by default; typing, paste and
 * autofill advance the focus. Motion: each character lands with a 96% press, a paste or autofill lands slot by slot,
 * a refused character shakes its slot, the row shakes once as it turns invalid. Reduced motion: none of it; the
 * invalid edge and `FieldError` carry the state.
 */
function InputOTP({
  className,
  'aria-invalid': ariaInvalid,
  ref,
  slotLabel: slotLabelProp,
  value,
  defaultValue,
  onValueChange,
  onValueInvalid,
  ...props
}: InputOTPProps) {
  const slotLabel = slotLabelProp ?? useLocale().labels.slot;
  const invalid = ariaInvalid === true || ariaInvalid === 'true';
  const rootRef = React.useRef<HTMLDivElement>(null);
  /** The uncontrolled value; controlled, `value` is the baseline the next entry is diffed against. */
  const latest = React.useRef(defaultValue ?? '');
  const [entry, setEntry] = React.useState<InputOTPContextValue['entry']>(null);
  const [rejected, setRejected] = React.useState<InputOTPContextValue['rejected']>(null);

  const slots = () => Array.from(rootRef.current?.querySelectorAll<HTMLInputElement>(slotSelector) ?? []);

  React.useImperativeHandle(
    ref,
    () => ({
      // Next frame: a reset in the same handler (`setValue('')` before `setError`) has rendered by then.
      focus: () =>
        requestAnimationFrame(() => {
          const inputs = slots();
          (inputs.find((input) => input.value === '') ?? inputs.at(-1))?.focus();
        }),
    }),
    [],
  );

  const handleValueChange: NonNullable<InputOTPProps['onValueChange']> = (next, details) => {
    const previous = value ?? latest.current;
    latest.current = next;
    onValueChange?.(next, details);
    // Deleting shifts the characters after it: that is not an entry.
    if (details.reason !== 'input-change' && details.reason !== 'input-paste') {
      setEntry(null);
      return;
    }
    let from = -1;
    let to = -1;
    for (let index = 0; index < next.length; index++) {
      if (next[index] === previous[index]) continue;
      if (from < 0) from = index;
      to = index;
    }
    setRejected(null);
    setEntry((current) => (from < 0 ? null : { from, to, parity: flip(current?.parity) }));
  };

  const handleValueInvalid: NonNullable<InputOTPProps['onValueInvalid']> = (attempted, details) => {
    onValueInvalid?.(attempted, details);
    // A paste drops separators (`123-456`) on purpose; only a typed character is refused.
    if (details.reason !== 'input-change') return;
    const index = slots().indexOf(details.event.target as HTMLInputElement);
    if (index < 0) return;
    setEntry(null);
    setRejected((current) => ({ index, parity: flip(current?.parity) }));
  };

  return (
    <InputOTPContext value={{ invalid, entry, rejected, slotLabel }}>
      <OTPFieldPrimitive.Root
        ref={rootRef}
        data-slot='input-otp'
        data-invalid={invalid || undefined}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        onValueInvalid={handleValueInvalid}
        className={cn(
          'flex max-w-full items-center gap-related',
          'data-invalid:animate-otp-shake motion-reduce:animate-none',
          className,
        )}
        {...props}
      />
    </InputOTPContext>
  );
}

type InputOTPSlotProps = Omit<OTPFieldPrimitive.Input.Props, 'className' | 'render'> & {
  className?: string;
};

/**
 * One character. Slots follow DOM order (no `index`). Label the first with a `<label htmlFor>` on the root's `id`; the
 * others take `slotLabel` ("Character 2 of 6").
 */
function InputOTPSlot({ className, ...props }: InputOTPSlotProps) {
  const { invalid, entry, rejected, slotLabel } = React.use(InputOTPContext);

  return (
    <OTPFieldPrimitive.Input
      data-slot='input-otp-slot'
      className={cn(
        inputSurfaceVariants({ scope: 'self' }),
        // `Input`'s box at `control-lg`, `text-control`, the field ring; touch: 44px and 16px text, so iOS does not zoom.
        // `shrink` + `min-w-0`: in a narrow column (320px) the slots give up width; `flex-1` stretches them to one.
        'relative size-control-lg min-w-0 shrink p-0 text-center text-control text-foreground tabular-nums',
        'pointer-coarse:size-11 pointer-coarse:text-[1rem]',
        // In an invalid `Field` the digits keep their color; only a slot flagged invalid turns them.
        'aria-invalid:text-destructive',
        // Focus selects the slot's character: the ring marks it, a selection box would only clutter the digit.
        'selection:bg-transparent focus-visible:z-10',
        'data-[entered=even]:animate-otp-fill-even data-[entered=odd]:animate-otp-fill-odd',
        'data-[rejected=even]:animate-otp-reject-even data-[rejected=odd]:animate-otp-reject-odd',
        'motion-reduce:animate-none',
        className,
      )}
      render={(inputProps, state) => {
        const entered = entry !== null && state.index >= entry.from && state.index <= entry.to;
        const first = state.index === 0;
        return (
          <input
            {...inputProps}
            // Incomplete: the empty slots are what is missing. Complete: the code itself is wrong.
            aria-invalid={invalid && !state.disabled && (state.complete || !state.filled) ? true : undefined}
            aria-label={
              first ? inputProps['aria-label'] : slotLabel({ position: state.index + 1, length: state.length })
            }
            aria-labelledby={first ? inputProps['aria-labelledby'] : undefined}
            data-entered={entered ? entry.parity : undefined}
            data-rejected={rejected?.index === state.index ? rejected.parity : undefined}
            // A paste or autofill lands slot by slot; the keyframes' `backwards` holds each one empty until its turn.
            style={
              entered
                ? { ...inputProps.style, animationDelay: `${(state.index - entry.from) * 30}ms` }
                : inputProps.style
            }
          />
        );
      }}
      {...props}
    />
  );
}

type InputOTPSeparatorProps = Omit<OTPFieldPrimitive.Separator.Props, 'className'> & {
  className?: string;
};

/** Splits the slots into groups, as authenticator apps print the code (`123 456`). */
function InputOTPSeparator({ className, ...props }: InputOTPSeparatorProps) {
  return (
    <OTPFieldPrimitive.Separator
      data-slot='input-otp-separator'
      className={cn('mx-1 h-0.5 w-3 shrink-0 rounded-full bg-border', className)}
      {...props}
    />
  );
}

export { InputOTP, InputOTPSlot, InputOTPSeparator };

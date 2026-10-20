import { MinusIcon, PlusIcon } from 'lucide-react';
import type * as React from 'react';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group';

interface IntegerInputProps extends Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'onChange' | 'max' | 'maxLength'
> {
  value: number;
  onValueChange: (value: number) => void;
  /** After the number: "days", "seats". */
  unit?: string;
  /** Stops "+" here and clamps what is typed. */
  max?: number;
  decrementLabel?: string;
  incrementLabel?: string;
}

/** A non-negative whole number between a minus and a plus. A cleared field reads as 0. */
function IntegerInput({
  value,
  onValueChange,
  unit,
  max,
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
  disabled,
  onFocus,
  className,
  ...props
}: IntegerInputProps) {
  return (
    <InputGroup className={className}>
      <InputGroupAddon align='inline-start'>
        <InputGroupButton
          size='icon-xs'
          emphasis='raised'
          aria-label={decrementLabel}
          disabled={disabled || value <= 0}
          onClick={() => onValueChange(value - 1)}>
          <MinusIcon />
        </InputGroupButton>
      </InputGroupAddon>
      <div className='flex flex-1 items-center justify-center gap-1.5'>
        <InputGroupInput
          // Text, not number: React leaves a number input alone while its text parses to the same value,
          // so typing 1 after 0 would stay "01".
          type='text'
          inputMode='numeric'
          value={String(value)}
          // Never `undefined`: a form library may answer that with the default value, so the last digit could not be
          // deleted.
          onChange={(e) => {
            const typed = Number(e.target.value.replace(/\D/g, ''));
            onValueChange(max === undefined ? typed : Math.min(typed, max));
          }}
          // Typing then replaces the number instead of appending to it.
          onFocus={(e) => {
            e.currentTarget.select();
            onFocus?.(e);
          }}
          disabled={disabled}
          maxLength={max === undefined ? undefined : String(max).length}
          // As wide as its digits, so number and unit center together as one line of text.
          style={{ width: `${String(value).length}ch` }}
          className='min-w-0 flex-none px-0 text-right font-medium tabular-nums'
          {...props}
        />
        {unit && <span className='text-body text-muted-foreground'>{unit}</span>}
      </div>
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          size='icon-xs'
          emphasis='raised'
          aria-label={incrementLabel}
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={() => onValueChange(value + 1)}>
          <PlusIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { IntegerInput };

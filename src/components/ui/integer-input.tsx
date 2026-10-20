import { MinusIcon, PlusIcon } from 'lucide-react';
import type * as React from 'react';
import { useUiStrings } from '~/lib/ui-config';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group';

import { cn } from '~/lib/utils';

interface IntegerStepperProps extends Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'onChange' | 'max' | 'maxLength'
> {
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  /** Stops "+" here and caps typing at as many digits. */
  max?: number;
}

/** Non-negative whole numbers only. A cleared field reads as 0. */
function IntegerStepper({ value, onChange, unit, max, disabled, onFocus, className, ...props }: IntegerStepperProps) {
  const strings = useUiStrings();

  return (
    <InputGroup className={className}>
      <InputGroupAddon align='inline-start'>
        <InputGroupButton
          size='icon-sm'
          emphasis='raised'
          aria-label={strings.decrease}
          disabled={disabled || value <= 0}
          onClick={() => onChange(value - 1)}>
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
          // Never `undefined`: react-hook-form answers that with the default value, so the last digit
          // could not be deleted.
          onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')))}
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
          size='icon-sm'
          emphasis='raised'
          aria-label={strings.increase}
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={() => onChange(value + 1)}>
          <PlusIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { IntegerStepper };

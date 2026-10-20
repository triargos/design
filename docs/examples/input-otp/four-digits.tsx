import { useId } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { InputOTP, InputOTPSlot } from '~/components/ui/input-otp';

/** `mask` hides the digits, for a PIN. */
export function InputOTPFourDigits() {
  const id = useId();
  return (
    <Field className='w-fit min-w-0'>
      <FieldLabel htmlFor={id}>PIN</FieldLabel>
      <InputOTP id={id} length={4} mask>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTP>
    </Field>
  );
}

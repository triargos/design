import { useId } from 'react';

import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { InputOTP, InputOTPSlot, InputOTPSeparator } from '~/components/ui/input-otp';

/** Six digits in two groups of three, as authenticator apps print them. */
export function InputOTPDefault() {
  const id = useId();
  return (
    <Field className='w-fit min-w-0'>
      <FieldLabel htmlFor={id}>Authentication code</FieldLabel>
      <InputOTP id={id} length={6}>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSeparator />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTP>
      <FieldDescription>Enter the 6-digit code from your authenticator app.</FieldDescription>
    </Field>
  );
}

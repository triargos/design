import { useId } from 'react';

import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { OTPField, OTPFieldInput, OTPFieldSeparator } from '~/components/ui/otp-field';

/** Six digits in two groups of three, as authenticator apps print them. */
export function OTPFieldDefault() {
  const id = useId();
  return (
    <Field className='w-fit min-w-0'>
      <FieldLabel htmlFor={id}>Authentication code</FieldLabel>
      <OTPField id={id} length={6}>
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldSeparator />
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldInput />
      </OTPField>
      <FieldDescription>Enter the 6-digit code from your authenticator app.</FieldDescription>
    </Field>
  );
}

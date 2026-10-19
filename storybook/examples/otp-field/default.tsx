import { useId } from 'react';

import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { OTPField, OTPFieldInput, OTPFieldSeparator } from '~/components/ui/otp-field';

/** Six digits in two groups of three, as the authenticator app prints them. */
export function OTPFieldDefault() {
  const id = useId();
  return (
    <Field className='w-fit min-w-0'>
      <FieldLabel htmlFor={id}>Code aus der Authenticator-App</FieldLabel>
      <OTPField id={id} length={6}>
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldSeparator />
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldInput />
      </OTPField>
      <FieldDescription>Geben Sie den 6-stelligen Code aus Ihrer App ein.</FieldDescription>
    </Field>
  );
}

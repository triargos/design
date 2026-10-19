import { useId } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { OTPField, OTPFieldInput } from '~/components/ui/otp-field';

export function OTPFieldFourDigits() {
  const id = useId();
  return (
    <Field className='w-fit min-w-0'>
      <FieldLabel htmlFor={id}>PIN</FieldLabel>
      <OTPField id={id} length={4} mask>
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldInput />
        <OTPFieldInput />
      </OTPField>
    </Field>
  );
}

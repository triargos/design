import { useId } from 'react';

import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { OTPField, OTPFieldInput, OTPFieldSeparator } from '~/components/ui/otp-field';

function Slots() {
  return (
    <>
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldSeparator />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </>
  );
}

/**
 * Incomplete: only the empty slots turn, they are what is missing. Wrong: every slot turns. Verifying: read-only, the
 * digits greyed. Disabled: the disabled fill.
 */
export function OTPFieldStates() {
  const id = useId();
  return (
    <div className='grid gap-group'>
      <Field invalid className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-incomplete`}>Incomplete</FieldLabel>
        <OTPField id={`${id}-incomplete`} length={6} defaultValue='481' aria-invalid>
          <Slots />
        </OTPField>
        <FieldError>Enter all 6 digits.</FieldError>
      </Field>
      <Field invalid className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-wrong`}>Wrong code</FieldLabel>
        <OTPField id={`${id}-wrong`} length={6} defaultValue='481920' aria-invalid>
          <Slots />
        </OTPField>
        <FieldError>That code didn’t work.</FieldError>
      </Field>
      <Field className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-verifying`}>Verifying</FieldLabel>
        <OTPField id={`${id}-verifying`} length={6} defaultValue='481920' readOnly>
          <Slots />
        </OTPField>
      </Field>
      <Field disabled className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-disabled`}>Disabled</FieldLabel>
        <OTPField id={`${id}-disabled`} length={6} defaultValue='481' disabled>
          <Slots />
        </OTPField>
      </Field>
    </div>
  );
}

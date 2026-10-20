import { useId } from 'react';

import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { InputOTP, InputOTPSlot, InputOTPSeparator } from '~/components/ui/input-otp';

function Slots() {
  return (
    <>
      <InputOTPSlot />
      <InputOTPSlot />
      <InputOTPSlot />
      <InputOTPSeparator />
      <InputOTPSlot />
      <InputOTPSlot />
      <InputOTPSlot />
    </>
  );
}

/**
 * Incomplete: only the empty slots turn, they are what is missing. Wrong: every slot turns. Verifying: read-only, the
 * digits greyed. Disabled: the disabled fill.
 */
export function InputOTPStates() {
  const id = useId();
  return (
    <div className='grid gap-group'>
      <Field invalid className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-incomplete`}>Incomplete</FieldLabel>
        <InputOTP id={`${id}-incomplete`} length={6} defaultValue='481' aria-invalid>
          <Slots />
        </InputOTP>
        <FieldError>Enter all 6 digits.</FieldError>
      </Field>
      <Field invalid className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-wrong`}>Wrong code</FieldLabel>
        <InputOTP id={`${id}-wrong`} length={6} defaultValue='481920' aria-invalid>
          <Slots />
        </InputOTP>
        <FieldError>That code didn’t work.</FieldError>
      </Field>
      <Field className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-verifying`}>Verifying</FieldLabel>
        <InputOTP id={`${id}-verifying`} length={6} defaultValue='481920' readOnly>
          <Slots />
        </InputOTP>
      </Field>
      <Field disabled className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-disabled`}>Disabled</FieldLabel>
        <InputOTP id={`${id}-disabled`} length={6} defaultValue='481' disabled>
          <Slots />
        </InputOTP>
      </Field>
    </div>
  );
}

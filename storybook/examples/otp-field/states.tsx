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
      <Field data-invalid className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-incomplete`}>Unvollständig</FieldLabel>
        <OTPField id={`${id}-incomplete`} length={6} defaultValue='481' aria-invalid>
          <Slots />
        </OTPField>
        <FieldError>Bitte geben Sie alle 6 Ziffern ein.</FieldError>
      </Field>
      <Field data-invalid className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-wrong`}>Falscher Code</FieldLabel>
        <OTPField id={`${id}-wrong`} length={6} defaultValue='481920' aria-invalid>
          <Slots />
        </OTPField>
        <FieldError>Der Code ist ungültig.</FieldError>
      </Field>
      <Field className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-verifying`}>Wird geprüft</FieldLabel>
        <OTPField id={`${id}-verifying`} length={6} defaultValue='481920' readOnly>
          <Slots />
        </OTPField>
      </Field>
      <Field data-disabled='true' className='w-fit min-w-0'>
        <FieldLabel htmlFor={`${id}-disabled`}>Deaktiviert</FieldLabel>
        <OTPField id={`${id}-disabled`} length={6} defaultValue='481' disabled>
          <Slots />
        </OTPField>
      </Field>
    </div>
  );
}

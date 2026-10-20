import { useId, useRef, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { OTPField, OTPFieldInput, OTPFieldSeparator } from '~/components/ui/otp-field';

const CORRECT_CODE = '123456';

/**
 * A two-factor sign-in step: the sixth digit submits, the slots are read-only while it verifies. A wrong code shakes
 * the row, clears it and puts the focus back on the first slot; typing clears the error.
 */
export function OTPFieldVerify() {
  const id = useId();
  const slots = useRef<{ focus: () => void }>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length < 6) {
      setError('Enter all 6 digits.');
      slots.current?.focus();
      return;
    }
    setStatus('verifying');
    setTimeout(() => {
      if (code === CORRECT_CODE) {
        setStatus('verified');
        return;
      }
      setStatus('idle');
      setCode('');
      setError('That code didn’t work.');
      slots.current?.focus();
    }, 700);
  };

  return (
    <form onSubmit={verify} className='flex w-fit min-w-0 flex-col gap-group'>
      <Field invalid={error !== null}>
        <FieldLabel htmlFor={id}>Authentication code</FieldLabel>
        <OTPField
          id={id}
          length={6}
          autoSubmit
          readOnly={status !== 'idle'}
          aria-invalid={error !== null}
          inputRef={slots}
          value={code}
          onValueChange={(value) => {
            setCode(value);
            setError(null);
          }}>
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldSeparator />
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldInput />
        </OTPField>
        {error === null ? (
          <FieldDescription>{status === 'verified' ? 'Verified.' : `Try ${CORRECT_CODE}.`}</FieldDescription>
        ) : (
          <FieldError>{error}</FieldError>
        )}
      </Field>
      <Button intent='primary' type='submit' isLoading={status === 'verifying'}>
        Verify
      </Button>
    </form>
  );
}

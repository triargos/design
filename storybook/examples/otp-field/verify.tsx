import { useId, useRef, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { OTPField, OTPFieldInput, OTPFieldSeparator } from '~/components/ui/otp-field';

const CORRECT_CODE = '123456';

/**
 * The login's two-factor step: the sixth digit submits, the slots are read-only while it verifies. A wrong code
 * shakes the row, clears it and puts the focus back on the first slot; typing clears the error.
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
      setError('Bitte geben Sie alle 6 Ziffern ein.');
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
      setError('Der Code ist ungültig.');
      slots.current?.focus();
    }, 700);
  };

  return (
    <form onSubmit={verify} className='flex w-fit min-w-0 flex-col gap-group'>
      <Field data-invalid={error !== null || undefined}>
        <FieldLabel htmlFor={id}>Code aus der Authenticator-App</FieldLabel>
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
          <FieldDescription>
            {status === 'verified' ? 'Bestätigt.' : `Zum Ausprobieren: ${CORRECT_CODE}`}
          </FieldDescription>
        ) : (
          <FieldError>{error}</FieldError>
        )}
      </Field>
      <Button type='submit' isLoading={status === 'verifying'}>
        Code verifizieren
      </Button>
    </form>
  );
}

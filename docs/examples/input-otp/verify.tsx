import { useId, useRef, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { InputOTP, InputOTPSlot, InputOTPSeparator } from '~/components/ui/input-otp';

const CORRECT_CODE = '123456';

/**
 * A two-factor sign-in step: the sixth digit submits, the slots are read-only while it verifies. A wrong code shakes
 * the row, clears it and puts the focus back on the first slot; typing clears the error.
 */
export function InputOTPVerify() {
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
        <InputOTP
          id={id}
          length={6}
          autoSubmit
          readOnly={status !== 'idle'}
          aria-invalid={error !== null}
          ref={slots}
          value={code}
          onValueChange={(value) => {
            setCode(value);
            setError(null);
          }}>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSeparator />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTP>
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

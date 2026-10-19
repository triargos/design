import { useState } from 'react';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp';

/** One slot per digit; the login’s two-factor code. */
export function InputOTPDefault() {
  const [value, setValue] = useState('4812');
  return (
    <InputOTP maxLength={6} value={value} onChange={setValue} aria-label='Code'>
      <InputOTPGroup>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

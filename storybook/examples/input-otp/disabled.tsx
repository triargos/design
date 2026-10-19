import { useState } from 'react';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp';

export function InputOTPDisabled() {
  const [value, setValue] = useState('481');
  return (
    <InputOTP maxLength={6} value={value} onChange={setValue} disabled aria-label='Code, gesperrt'>
      <InputOTPGroup>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

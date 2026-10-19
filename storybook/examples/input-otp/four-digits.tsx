import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp';

export function InputOTPFourDigits() {
  return (
    <InputOTP maxLength={4} aria-label='PIN'>
      <InputOTPGroup>
        {[0, 1, 2, 3].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

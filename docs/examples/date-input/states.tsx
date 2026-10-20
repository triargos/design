import { DateInput, TimeInput } from '~/components/ui/date-input';

/** Invalid and disabled, for a date and a time. */
export function DateInputStates() {
  return (
    <div className='grid w-fit grid-cols-2 gap-2'>
      <DateInput
        value='2025-03-14'
        onValueChange={() => undefined}
        aria-invalid
        aria-label='Date, invalid'
        className='w-48'
      />
      <DateInput
        value='2025-03-14'
        onValueChange={() => undefined}
        disabled
        aria-label='Date, disabled'
        className='w-48'
      />
      <TimeInput
        value='09:30'
        onValueChange={() => undefined}
        aria-invalid
        aria-label='Time, invalid'
        className='w-48'
      />
      <TimeInput value='09:30' onValueChange={() => undefined} disabled aria-label='Time, disabled' className='w-48' />
    </div>
  );
}

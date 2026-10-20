import { DateInput } from '~/components/ui/date-input';

export function DateInputStates() {
  return (
    <div className='flex flex-wrap gap-2'>
      <DateInput
        value='2025-03-14'
        onValueChange={() => undefined}
        aria-invalid
        aria-label='Invalid'
        className='w-48'
      />
      <DateInput value='2025-03-14' onValueChange={() => undefined} disabled aria-label='Disabled' className='w-48' />
    </div>
  );
}

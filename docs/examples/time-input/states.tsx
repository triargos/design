import { TimeInput } from '~/components/ui/time-input';

export function TimeInputStates() {
  return (
    <div className='flex flex-wrap gap-2'>
      <TimeInput value='' onValueChange={() => undefined} aria-label='Empty' className='w-48' />
      <TimeInput value='09:30' onValueChange={() => undefined} aria-invalid aria-label='Invalid' className='w-48' />
      <TimeInput value='09:30' onValueChange={() => undefined} disabled aria-label='Disabled' className='w-48' />
    </div>
  );
}

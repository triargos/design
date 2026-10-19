import { TimeInput } from '~/components/ui/time-input';

export function TimeInputStates() {
  return (
    <div className='flex flex-wrap gap-2'>
      <TimeInput value='' onChange={() => undefined} aria-label='Leer' className='w-48' />
      <TimeInput value='08:30' onChange={() => undefined} aria-invalid aria-label='Ungültig' className='w-48' />
      <TimeInput value='08:30' onChange={() => undefined} disabled aria-label='Deaktiviert' className='w-48' />
    </div>
  );
}

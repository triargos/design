import { Input } from '~/components/ui/input';

/** Read-only keeps the text selectable and never rings; invalid turns the edge; disabled drops the lift. */
export function InputStates() {
  return (
    <div className='grid w-72 gap-2'>
      <Input aria-label='Nur lesen' readOnly defaultValue='Erika Mustermann' />
      <Input aria-label='Ungültig' aria-invalid defaultValue='erika@' />
      <Input aria-label='Deaktiviert' disabled defaultValue='Erika Mustermann' />
    </div>
  );
}

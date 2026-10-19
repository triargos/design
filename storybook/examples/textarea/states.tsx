import { Textarea } from '~/components/ui/textarea';

export function TextareaStates() {
  return (
    <div className='grid w-96 gap-2'>
      <Textarea aria-label='Nur lesen' readOnly defaultValue='Der Elternabend beginnt um 19 Uhr.' />
      <Textarea aria-label='Ungültig' aria-invalid />
      <Textarea aria-label='Deaktiviert' disabled defaultValue='Der Elternabend beginnt um 19 Uhr.' />
    </div>
  );
}

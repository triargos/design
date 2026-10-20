import { Textarea } from '~/components/ui/textarea';

export function TextareaStates() {
  return (
    <div className='grid w-96 gap-2'>
      <Textarea aria-label='Read-only' readOnly defaultValue='The review moved to Thursday.' />
      <Textarea aria-label='Invalid' aria-invalid />
      <Textarea aria-label='Disabled' disabled defaultValue='The review moved to Thursday.' />
    </div>
  );
}

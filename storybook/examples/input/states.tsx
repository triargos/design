import { Input } from '~/components/ui/input';

/** Read-only keeps the text selectable and never rings; invalid turns the edge; disabled drops the lift. */
export function InputStates() {
  return (
    <div className='grid w-72 gap-2'>
      <Input aria-label='Read-only' readOnly defaultValue='Maya Chen' />
      <Input aria-label='Invalid' aria-invalid defaultValue='maya@' />
      <Input aria-label='Disabled' disabled defaultValue='Maya Chen' />
    </div>
  );
}

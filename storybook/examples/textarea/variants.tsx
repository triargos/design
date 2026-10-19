import { InputGroup } from '~/components/ui/input-group';
import { Textarea } from '~/components/ui/textarea';

/** `ghost` drops the surface, for a textarea inside an `InputGroup` that owns it. */
export function TextareaVariants() {
  return (
    <div className='grid w-96 gap-2'>
      <Textarea aria-label='Standard' defaultValue='Der Elternabend beginnt um 19 Uhr.' />
      <InputGroup>
        <Textarea
          variant='ghost'
          aria-label='Ohne Fläche'
          defaultValue='Der Elternabend beginnt um 19 Uhr.'
          className='px-3.5 py-2.5'
        />
      </InputGroup>
    </div>
  );
}

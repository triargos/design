import { InputGroup, InputGroupAddon, InputGroupText } from '~/components/ui/input-group';
import { Textarea } from '~/components/ui/textarea';

/** A ghost textarea in the group, with a count in the block-end addon. */
export function InputGroupWithTextarea() {
  return (
    <InputGroup className='w-96'>
      <Textarea
        variant='ghost'
        aria-label='Nachricht'
        defaultValue='Der Elternabend beginnt um 19 Uhr.'
        className='px-3.5 py-2.5'
      />
      <InputGroupAddon align='block-end'>
        <InputGroupText className='ml-auto text-caption tabular-nums'>34 / 500</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

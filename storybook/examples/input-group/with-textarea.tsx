import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '~/components/ui/input-group';

/** `InputGroupTextarea`, with a count in the block-end addon. */
export function InputGroupWithTextarea() {
  return (
    <InputGroup className='w-96'>
      <InputGroupTextarea aria-label='Comment' defaultValue='The review moved to Thursday.' />
      <InputGroupAddon align='block-end'>
        <InputGroupText className='ml-auto text-caption tabular-nums'>29 / 500</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

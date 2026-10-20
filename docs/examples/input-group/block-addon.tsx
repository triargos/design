import { IconBold, IconItalic, IconLink } from '@tabler/icons-react';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '~/components/ui/input-group';

/** `align='block-end'`: a toolbar under the text. */
export function InputGroupBlockAddon() {
  return (
    <InputGroup className='w-96'>
      <InputGroupTextarea placeholder='Add a comment' aria-label='Comment' />
      <InputGroupAddon align='block-end' className='border-t'>
        <InputGroupButton size='icon-xs' aria-label='Bold'>
          <IconBold />
        </InputGroupButton>
        <InputGroupButton size='icon-xs' aria-label='Italic'>
          <IconItalic />
        </InputGroupButton>
        <InputGroupButton size='icon-xs' aria-label='Link'>
          <IconLink />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

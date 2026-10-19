import { BoldIcon, ItalicIcon, LinkIcon } from 'lucide-react';

import { InputGroup, InputGroupAddon, InputGroupButton } from '~/components/ui/input-group';
import { Textarea } from '~/components/ui/textarea';

/** `align='block-end'`: a toolbar under a ghost textarea. */
export function InputGroupBlockAddon() {
  return (
    <InputGroup className='w-96'>
      <Textarea variant='ghost' placeholder='Nachricht schreiben' className='px-3.5 py-2.5' />
      <InputGroupAddon align='block-end' className='border-t'>
        <InputGroupButton size='icon-xs' aria-label='Fett'>
          <BoldIcon />
        </InputGroupButton>
        <InputGroupButton size='icon-xs' aria-label='Kursiv'>
          <ItalicIcon />
        </InputGroupButton>
        <InputGroupButton size='icon-xs' aria-label='Link'>
          <LinkIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

import { CopyButton } from '~/components/ui/copy-button';
import { InputGroup, InputGroupAddon, InputGroupInput, inputGroupButtonVariants } from '~/components/ui/input-group';

const LOGIN_URL = 'https://eltern.example/?org=gs-am-see';

export function CopyButtonInAField() {
  return (
    <InputGroup className='max-w-md'>
      <InputGroupInput value={LOGIN_URL} readOnly aria-label='Login-Link' />
      <InputGroupAddon align='inline-end'>
        <CopyButton value={LOGIN_URL} className={inputGroupButtonVariants({ size: 'icon-sm' })} />
      </InputGroupAddon>
    </InputGroup>
  );
}

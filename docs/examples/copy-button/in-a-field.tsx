import { CopyButton } from '~/components/ui/copy-button';
import { InputGroup, InputGroupAddon, InputGroupInput, inputGroupButtonVariants } from '~/components/ui/input-group';

const INVITE_LINK = 'https://acme.example/invite/k3f9';

export function CopyButtonInAField() {
  return (
    <InputGroup className='max-w-md'>
      <InputGroupInput value={INVITE_LINK} readOnly aria-label='Invite link' />
      <InputGroupAddon align='inline-end'>
        <CopyButton
          value={INVITE_LINK}
          label='Copy invite link'
          className={inputGroupButtonVariants({ size: 'icon-xs' })}
        />
      </InputGroupAddon>
    </InputGroup>
  );
}

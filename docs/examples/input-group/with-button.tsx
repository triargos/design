import { CopyIcon, EyeIcon } from 'lucide-react';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group';

/**
 * An icon for a field-local toggle, text for a field-local action, `size='action'` for a field that submits on its
 * own: a raised button 4px in.
 */
export function InputGroupWithButton() {
  return (
    <div className='grid w-96 gap-2'>
      <InputGroup>
        <InputGroupInput type='password' defaultValue='sk_live_123456' aria-label='API key' />
        <InputGroupAddon align='inline-end'>
          <InputGroupButton size='icon-xs' aria-label='Show'>
            <EyeIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput readOnly defaultValue='https://example.com/invite/7f3a' aria-label='Invite link' />
        <InputGroupAddon align='inline-end'>
          <InputGroupButton>
            <CopyIcon />
            Copy
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput type='email' placeholder='name@example.com' aria-label='Email' />
        <InputGroupAddon align='inline-end'>
          <InputGroupButton size='action'>Invite</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

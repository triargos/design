import { SaveIcon } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

/** `{ anchor }`: the toast points at the button that failed, styled like its tooltip, and closes after 2 seconds. */
export function ToastAnchored() {
  const saveRef = useRef<HTMLButtonElement>(null);

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        render={
          <Button
            ref={saveRef}
            aria-label='Save'
            size='icon'
            onClick={() => toast.error('Couldn’t save draft', { anchor: saveRef.current })}
          />
        }>
        <SaveIcon aria-hidden='true' />
      </TooltipTrigger>
      <TooltipContent>Save</TooltipContent>
    </Tooltip>
  );
}

import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Callout, CalloutContent } from '~/components/ui/callout';
import { FadeOut } from '~/components/ui/fade-in';

/** `FadeOut`: 300ms, as the content leaves. */
export function FadeInFadeOut() {
  const [show, setShow] = useState(true);
  return (
    <div className='flex w-full max-w-md flex-col items-start gap-4'>
      <Button type='button' intent='neutral' emphasis='raised' size='sm' onClick={() => setShow(!show)}>
        {show ? 'Ausblenden' : 'Einblenden'}
      </Button>
      <FadeOut show={show} className='w-full'>
        <Callout>
          <CalloutContent>Die Synchronisierung ist abgeschlossen.</CalloutContent>
        </Callout>
      </FadeOut>
    </div>
  );
}

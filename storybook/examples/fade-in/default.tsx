import { RotateCcwIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { FadeIn } from '~/components/ui/fade-in';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/**
 * Content that arrives after a load fades in once: 150ms, opacity only. In the app `useShouldFadeIn` skips it when
 * the first render already has the data.
 */
export function FadeInDefault() {
  const [run, setRun] = useState(0);
  return (
    <div className='flex w-full max-w-md items-start gap-4'>
      <FadeIn key={run} className='min-w-0 flex-1'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Anmeldungen</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='p-group text-body text-muted-foreground'>12 neue seit gestern</InsetCardContent>
        </InsetCard>
      </FadeIn>
      <Button
        type='button'
        intent='neutral'
        emphasis='ghost'
        size='icon-sm'
        aria-label='Noch einmal'
        onClick={() => setRun((value) => value + 1)}>
        <RotateCcwIcon />
      </Button>
    </div>
  );
}

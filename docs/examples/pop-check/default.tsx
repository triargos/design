import { AnimatePresence } from 'framer-motion';
import { RotateCcwIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { PopCheck } from '~/components/ui/pop-check';

/**
 * A check that pops in tilted and draws its stroke, as a keyed child of `AnimatePresence`. CopyButton and Checkbox use
 * it; reduced motion cross-fades.
 */
export function PopCheckDefault() {
  const [run, setRun] = useState(0);
  return (
    <div className='flex items-center gap-4'>
      <span className='flex size-10 items-center justify-center rounded-full bg-success-subtle text-success'>
        <AnimatePresence mode='popLayout'>
          <PopCheck key={run} className='size-5' />
        </AnimatePresence>
      </span>
      <Button emphasis='ghost' size='icon-sm' aria-label='Replay' onClick={() => setRun((value) => value + 1)}>
        <RotateCcwIcon />
      </Button>
    </div>
  );
}

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type * as React from 'react';

import { cardCollapseTransition } from '~/components/ui/card';

import { cn } from '~/lib/utils';

// grid-template-rows, not height: fr values interpolate without the `auto` swap (see `CardFooter`).
const collapsed = { gridTemplateRows: '0fr', opacity: 0 } as const;
const expanded = { gridTemplateRows: '1fr', opacity: 1 } as const;

/**
 * Folds content open below a field while `show`: a follow-up field or a note that belongs to the field above. The
 * 8px gap folds with it. With `elbow`, a line hangs the content off the field: it starts under the field's text
 * (1px border + px-3.5) and ends at the middle of a 40px control, which is indented to make room.
 */
function FieldReveal({
  show,
  elbow = false,
  className,
  children,
}: {
  show: boolean;
  elbow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          data-slot='field-reveal'
          initial={reduceMotion ? false : collapsed}
          animate={{ ...expanded, transition: cardCollapseTransition }}
          exit={reduceMotion ? { opacity: 0 } : { ...collapsed, transition: cardCollapseTransition }}
          // -mx-1/-mb-1 + px-1/pb-1: room for a focus ring inside the clip.
          className='-mx-1 -mb-1 grid overflow-hidden'>
          {/* min-h-0: grid items refuse to shrink below their content as the row folds to 0fr. */}
          <div className='min-h-0 overflow-hidden px-1 pb-1'>
            <div className={cn('relative pt-2', elbow && 'pl-7', className)}>
              {elbow && (
                <span
                  aria-hidden
                  className='absolute top-0 left-[calc(--spacing(3.5)+1px)] h-7 w-2.5 rounded-bl-md border-b border-l border-border'
                />
              )}
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { FieldReveal };

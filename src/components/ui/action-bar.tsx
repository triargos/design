import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { swapTransition, useBottomNavDock } from '~/components/ui/bottom-nav';
import { cn } from '~/lib/utils';

type ActionBarProps = {
  /** Shown while true (something is selected); it springs in and out, so keep it mounted. */
  readonly open: boolean;
  /** Names the toolbar ("Selection"). */
  readonly 'aria-label': string;
  readonly className?: string;
  readonly children: React.ReactNode;
};

/**
 * A floating toolbar for what is selected: the count, clear, the actions. In the page it sticks to the bottom of the
 * scrolling column (`sticky bottom-4 self-center`, in a flex column). On a phone, under a `BottomNavProvider` with a
 * `BottomNav` showing, it docks in the nav instead: the tabs and the main action step aside until it closes. A
 * docked bar answers container queries from the nav's width. 6px in from the 16px popup corner, 36px buttons
 * (`rounded-control`, 10px) are concentric with it. One per page.
 */
function ActionBar({ open, className, children, 'aria-label': ariaLabel }: ActionBarProps) {
  const nav = useBottomNavDock();
  const dock = nav?.dock ?? null;
  const setDocked = nav?.setDocked;
  const reduced = useReducedMotion() ?? false;

  React.useEffect(() => {
    if (setDocked === undefined) return;
    setDocked(open && dock !== null);
    return () => setDocked(false);
  }, [open, dock, setDocked]);

  const hidden = { opacity: 0, scale: reduced ? 1 : 0.95, y: reduced ? 0 : 8 };
  const bar = (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          role='toolbar'
          aria-label={ariaLabel}
          data-slot='action-bar'
          data-surface='popup'
          initial={hidden}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={hidden}
          transition={swapTransition}
          className={cn(
            'pointer-events-auto flex origin-bottom items-center gap-related rounded-popup bg-popover p-1.5 text-control text-popover-foreground shadow-popup',
            dock === null ? 'sticky bottom-4 self-center' : 'col-span-full row-start-1 justify-self-center',
            className,
          )}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return dock === null ? bar : createPortal(bar, dock);
}

export { ActionBar };

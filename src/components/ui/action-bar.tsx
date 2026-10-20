import { AnimatePresence, motion, type Transition, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useBottomNavDock } from '~/components/ui/bottom-nav';
import { cn } from '~/lib/utils';

type ActionBarProps = {
  /** Shown while true (something is selected); it animates in and out, so keep it mounted. */
  readonly open: boolean;
  /** Names the toolbar ("Selection"). */
  readonly 'aria-label': string;
  readonly className?: string;
  readonly children: React.ReactNode;
};

/** In the page: rises 8px from 95% on one spring with no bounce, so a quick select-clear turns around mid-way. */
const inlineTransition: Transition = { type: 'spring', duration: 0.3, bounce: 0, opacity: { duration: 0.15 } };

/**
 * A floating toolbar for what is selected: the count, clear, the actions, on the inverted surface like the
 * `BottomNav`. In the page it sticks to the bottom of the scrolling column (`sticky bottom-4 self-center`, in a flex
 * column). On a phone, under a `BottomNavProvider` with a `BottomNav` showing, it docks in the nav instead: the nav's
 * shell morphs to fit it and its items cascade in. A docked bar answers container queries from the nav's width. 6px in
 * from the 16px corner, 36px buttons (`rounded-control`, 10px) are concentric with it. One per page.
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

  const toolbar = (key: string, motionProps: React.ComponentProps<typeof motion.div>, surface: string) => (
    <motion.div
      key={key}
      role='toolbar'
      aria-label={ariaLabel}
      data-slot='action-bar'
      className={cn('flex items-center gap-related p-1.5 text-control', surface, className)}
      {...motionProps}>
      {children}
    </motion.div>
  );

  if (dock !== null) {
    // The nav animates the morph and the cascade; the bar only stays for the nav's fade when it closes.
    return createPortal(
      <AnimatePresence initial={false}>
        {open && toolbar('docked', { initial: false, exit: { opacity: 0, transition: { duration: 0.15 } } }, '')}
      </AnimatePresence>,
      dock,
    );
  }

  const hidden = { opacity: 0, scale: reduced ? 1 : 0.95, y: reduced ? 0 : 8 };
  return (
    <AnimatePresence initial={false}>
      {open &&
        toolbar(
          'inline',
          {
            'data-surface': 'inverse',
            initial: hidden,
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: hidden,
            transition: inlineTransition,
          } as React.ComponentProps<typeof motion.div>,
          'sticky bottom-4 origin-bottom self-center rounded-popup bg-popover text-popover-foreground shadow-popup',
        )}
    </AnimatePresence>
  );
}

export { ActionBar };

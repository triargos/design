import { AnimatePresence, motion } from 'framer-motion';
import { PropsWithChildren, type ReactNode, useRef } from 'react';

import { cn } from '~/lib/utils';

type FadeInProps = {
  duration?: number;
  enabled?: boolean;
  className?: string;
  children: ReactNode;
};

function FadeIn({ duration = 0.15, enabled = true, children, className }: FadeInProps) {
  const classes = cn('space-y-4', className);

  if (!enabled) {
    return <div className={classes}>{children}</div>;
  }

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

// Fade only when content actually arrives async: if the first render already has
// data (cached collection, SSR), never animate; otherwise animate exactly once.
function useShouldFadeIn(result: { _tag: string } | boolean): boolean {
  const isPending = typeof result === 'boolean' ? result : result._tag === 'Initial' || result._tag === 'Loading';
  const startedPending = useRef<boolean | null>(null);

  if (startedPending.current === null) {
    startedPending.current = isPending;
  }

  return startedPending.current && !isPending;
}

export { FadeIn, useShouldFadeIn };

export const FadeOut = ({ children, className }: PropsWithChildren<FadeInProps>) => {
  return (
    <AnimatePresence>
      <motion.section
        className={className}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}>
        {children}
      </motion.section>
    </AnimatePresence>
  );
};

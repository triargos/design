import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useState } from 'react';

/** Content that arrives after a load fades in once: 150ms, opacity only. `enabled={false}` renders it at rest. */
function FadeIn({
  enabled = true,
  className,
  children,
}: {
  enabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

/**
 * Whether content should fade in: only when it arrives after the first render. Data on the first render (cached,
 * prerendered) never fades. Pass whether the data is still loading.
 */
function useShouldFadeIn(pending: boolean): boolean {
  const [startedPending] = useState(pending);
  return startedPending && !pending;
}

/** Content that leaves fades out over 300ms. Stays mounted and takes `show`, so the exit can play. */
function FadeOut({ show, className, children }: { show: boolean; className?: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className={className} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { FadeIn, FadeOut, useShouldFadeIn };

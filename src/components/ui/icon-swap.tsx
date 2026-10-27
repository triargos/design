import { motion, type Transition, useReducedMotion } from 'framer-motion';

import { cn } from '~/lib/utils';

/** Icon swaps: in from 25% and blurred, out the same way, on one spring with no bounce. Reduced motion: a cross-fade. */
const iconSwap: Transition = { type: 'spring', duration: 0.3, bounce: 0 };
const iconFade: Transition = { duration: 0.1 };

/** Motion props for an icon that enters and leaves inside `AnimatePresence`. */
function useIconSwap() {
  const reduced = useReducedMotion() ?? false;
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' };
  return {
    initial: hidden,
    animate: reduced ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: hidden,
    transition: reduced ? iconFade : iconSwap,
  };
}

/** A check that swaps in like any icon and draws its stroke from the short arm to the long one, just behind the pop. */
function DrawnCheck({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('tabler-icon', className)}
      {...useIconSwap()}>
      <motion.path
        d='M4 12l5 5L20 6'
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ type: 'spring', duration: 0.3, bounce: 0, delay: 0.06 }}
      />
    </motion.svg>
  );
}

export { DrawnCheck, useIconSwap };

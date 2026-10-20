import { motion, type Transition, useReducedMotion } from 'framer-motion';

// Springs with a short settle: `restDelta`/`restSpeed` as in `cardRevealTransition`, so the end does not snap.
/** The check pops in past full size and settles. */
const popIn: Transition = { type: 'spring', duration: 0.4, bounce: 0.45, restDelta: 0.001, restSpeed: 0.01 };
/** The leaving icon shrinks away without overshoot. */
const popOut: Transition = { type: 'spring', duration: 0.25, bounce: 0, restDelta: 0.001, restSpeed: 0.01 };
/** The check's stroke draws from the short arm to the long one, just behind the pop. */
const draw: Transition = { type: 'spring', duration: 0.35, bounce: 0, delay: 0.06 };
const fade: Transition = { duration: 0.1 };

/**
 * Motion props for an icon inside `AnimatePresence`: springs in from 40% and blurred, shrinks and blurs out. Reduced
 * motion: a plain cross-fade.
 */
function usePop() {
  const reduced = useReducedMotion() ?? false;
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, filter: 'blur(3px)' };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' };
  return {
    initial: hidden,
    animate: shown,
    exit: { ...hidden, transition: reduced ? fade : popOut },
    transition: reduced ? fade : popIn,
  };
}

/**
 * A check that pops in tilted and draws its stroke; render it as a keyed child of `AnimatePresence`. Shared by
 * `CopyButton` and `Checkbox`.
 */
function PopCheck({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  const reduced = useReducedMotion() ?? false;
  const { initial, animate, ...pop } = usePop();
  return (
    <motion.svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      initial={reduced ? initial : { ...initial, rotate: -25 }}
      animate={reduced ? animate : { ...animate, rotate: 0 }}
      {...pop}>
      <motion.path
        d='M4 12l5 5L20 6'
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={draw}
      />
    </motion.svg>
  );
}

export { PopCheck, usePop };

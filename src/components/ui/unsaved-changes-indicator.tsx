import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

const textClassName = 'text-body text-muted-foreground';

/** Says there are unsaved changes, next to the save action, while `show` is true. */
export function UnsavedChangesIndicator({
  show,
  animated = true,
  children = 'Unsaved changes',
}: {
  show: boolean;
  /** Off inside a container that animates its own reveal (`InsetCardFooter`): a second entrance on top reads as wobble. */
  animated?: boolean;
  children?: ReactNode;
}) {
  if (!animated) return show ? <span className={textClassName}>{children}</span> : null;

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className={textClassName}>
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

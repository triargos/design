import { AnimatePresence, motion } from 'framer-motion';

import { useUiStrings } from '~/lib/ui-config';

const textClassName = 'text-body text-muted-foreground';

export function UnsavedChangesIndicator({
  show,
  animated = true,
}: {
  show: boolean;
  /** Off inside a container that animates its own reveal (`InsetCardFooter`): a second entrance on top reads as wobble. */
  animated?: boolean;
}) {
  const strings = useUiStrings();

  if (!animated) return show ? <span className={textClassName}>{strings.unsavedChanges}</span> : null;

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className={textClassName}>
          {strings.unsavedChanges}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

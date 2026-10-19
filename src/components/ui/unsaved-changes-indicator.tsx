import { AnimatePresence, motion } from 'framer-motion';
import { useUiStrings } from '~/lib/ui-config';

interface UnsavedChangesIndicatorProps {
  show: boolean;
  /**
   * Opt out when the indicator sits inside a container that already animates
   * its reveal (e.g. InsetCardFooter) — a second entrance on top of the
   * container's reads as wobble.
   */
  animated?: boolean;
}

export function UnsavedChangesIndicator({ show, animated = true }: UnsavedChangesIndicatorProps) {
  const strings = useUiStrings();

  if (!animated) {
    return show ? <span className='text-body text-muted-foreground'>{strings.unsavedChanges}</span> : null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className='text-body text-muted-foreground'>
          {strings.unsavedChanges}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

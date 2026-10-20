import { AnimatePresence, motion, type Transition, useReducedMotion } from 'framer-motion';
import { IconCopy } from '@tabler/icons-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Button, type ButtonProps } from '~/components/ui/button';

import { cn } from '~/lib/utils';

/** How long the check stays after a copy. */
const COPIED_MS = 2000;

interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children' | 'value'> {
  /** The text written to the clipboard. */
  value: string;
  /** The accessible name of the icon-only button. With `children`, the text names it. */
  label?: string;
  /** Announced to screen readers after a copy; the visible label does not change. */
  copiedLabel?: string;
  /** Visible text next to the icon; a function gets whether the value was just copied. */
  children?: ReactNode | ((copied: boolean) => ReactNode);
  /** After a successful copy, e.g. a toast. */
  onCopied?: () => void;
}

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

/**
 * The copy icon and the check share one grid cell: on copy the copy icon leaves as the check comes in and draws; after
 * 2s the copy icon comes back.
 */
function CopyIconSwap({ copied }: { copied: boolean }) {
  const swap = useIconSwap();
  return (
    <span aria-hidden='true' className='grid *:col-start-1 *:row-start-1'>
      <AnimatePresence initial={false}>
        {copied ? (
          <DrawnCheck key='check' className='text-success' />
        ) : (
          <motion.span key='copy' className='grid' {...swap}>
            <IconCopy />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Copies `value`; the icon springs into a check for 2s. Icon-only and ghost by default. */
function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  children,
  onCopied,
  size = children === undefined ? 'icon' : 'default',
  emphasis = 'ghost',
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    onCopied?.();
  };

  const text = typeof children === 'function' ? children(copied) : children;
  return (
    <Button
      data-slot='copy-button'
      data-copied={copied || undefined}
      size={size}
      emphasis={emphasis}
      {...props}
      aria-label={text === undefined ? label : undefined}
      onClick={() => void copy()}>
      <CopyIconSwap copied={copied} />
      {text}
      <span role='status' className='sr-only'>
        {copied ? copiedLabel : ''}
      </span>
    </Button>
  );
}

export { CopyButton };

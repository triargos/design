import { AnimatePresence, motion } from 'framer-motion';
import { CopyIcon } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Button, type ButtonProps } from '~/components/ui/button';
import { PopCheck, usePop } from '~/components/ui/pop-check';

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

/**
 * The copy icon and the check share one grid cell. On copy the copy icon shrinks and blurs out while the check springs
 * in, tilted, and draws its stroke; after 2s the copy icon springs back. Reduced motion: a plain cross-fade.
 */
function CopyIconSwap({ copied }: { copied: boolean }) {
  const pop = usePop();

  return (
    <span aria-hidden='true' className='grid *:col-start-1 *:row-start-1'>
      <AnimatePresence initial={false}>
        {copied ? (
          <PopCheck key='check' className='text-success' />
        ) : (
          <motion.span key='copy' className='grid' {...pop}>
            <CopyIcon />
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
  size = children === undefined ? 'icon-sm' : 'sm',
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

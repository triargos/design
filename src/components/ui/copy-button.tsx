import { IconCopy } from '@tabler/icons-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Button, type ButtonProps } from '~/components/ui/button';
import { DrawnCheck, IconSwap } from '~/components/ui/icon-swap';
import { useLocale } from '~/components/ui/locale';

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
 * The copy icon and the check share one grid cell: on copy the copy icon leaves as the check comes in and draws; after
 * 2s the copy icon comes back.
 */
function CopyIconSwap({ copied }: { copied: boolean }) {
  return (
    <span aria-hidden='true' className='grid *:col-start-1 *:row-start-1'>
      <IconSwap shown={!copied}>
        <IconCopy />
      </IconSwap>
      <DrawnCheck shown={copied} className='text-success' />
    </span>
  );
}

/** Copies `value`; the icon springs into a check for 2s. Icon-only and ghost by default. */
function CopyButton({
  value,
  label: labelProp,
  copiedLabel: copiedLabelProp,
  children,
  onCopied,
  size = children === undefined ? 'icon' : 'default',
  emphasis = 'ghost',
  ...props
}: CopyButtonProps) {
  const { labels } = useLocale();
  const label = labelProp ?? labels.copy;
  const copiedLabel = copiedLabelProp ?? labels.copied;
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

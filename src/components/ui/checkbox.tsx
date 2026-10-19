import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon } from 'lucide-react';

import { PopCheck, usePop } from '~/components/ui/pop-check';

import { cn } from '~/lib/utils';

/**
 * A flat 16px control, shared by `Checkbox` and `RadioGroupItem`; no shadows. Resting: transparent with a 1px
 * `neutral-border` rim inside the box; hover fills it with the `neutral-subtle` veil. Checked: the brand fill, no rim.
 * Focus and invalid recolor the rim, as on `Input`. Disabled: the disabled fill, no rim. The `after:` box grows the
 * target past the label gap.
 */
export const selectionControlSurface = [
  'peer relative flex size-4 shrink-0 items-center justify-center inset-ring inset-ring-neutral-border outline-none',
  'transition-[background-color,box-shadow,color,scale] duration-feedback',
  'after:absolute after:-inset-x-3 after:-inset-y-2',
  'not-data-disabled:hover:bg-neutral-subtle not-data-disabled:active:scale-[0.92]',
  'focus-visible:ring-3 focus-visible:ring-ring/24 focus-visible:inset-ring-ring',
  'aria-invalid:inset-ring-destructive-border focus-visible:aria-invalid:ring-destructive/16 dark:focus-visible:aria-invalid:ring-destructive/24',
  'data-checked:bg-primary-solid data-checked:text-primary-solid-foreground data-checked:inset-ring-transparent',
  'not-data-disabled:data-checked:hover:bg-[color-mix(in_oklch,var(--primary-solid),black_8%)]',
  'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:inset-ring-transparent',
  'data-checked:data-disabled:bg-disabled data-checked:data-disabled:text-disabled-foreground',
];

/** The check or dash, swapped in one grid cell with the `CopyButton` pop: springs in, the check draws its stroke. */
function CheckboxMark({ checked, indeterminate }: { checked: boolean; indeterminate: boolean }) {
  const pop = usePop();
  return (
    <AnimatePresence initial={false}>
      {indeterminate ? (
        <motion.span key='minus' className='grid' {...pop}>
          <MinusIcon />
        </motion.span>
      ) : checked ? (
        <PopCheck key='check' strokeWidth={2.5} />
      ) : null}
    </AnimatePresence>
  );
}

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        selectionControlSurface,
        'rounded-control-xs',
        'data-indeterminate:bg-primary-solid data-indeterminate:text-primary-solid-foreground data-indeterminate:inset-ring-transparent',
        'not-data-disabled:data-indeterminate:hover:bg-[color-mix(in_oklch,var(--primary-solid),black_8%)]',
        'data-indeterminate:data-disabled:bg-disabled data-indeterminate:data-disabled:text-disabled-foreground',
        className,
      )}
      {...props}>
      {/* Kept mounted so `AnimatePresence` inside can play the exit. */}
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot='checkbox-indicator'
        className='pointer-events-none grid text-current *:col-start-1 *:row-start-1 [&_svg]:size-3 [&_svg]:stroke-[2.5]'
        render={(props, state) => (
          <span {...props}>
            <CheckboxMark checked={state.checked} indeterminate={state.indeterminate} />
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

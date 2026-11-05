import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { cva } from 'class-variance-authority';
import { IconMinus } from '@tabler/icons-react';

import { DrawnCheck, IconSwap } from '~/components/ui/icon-swap';
import { useAccessibleNameCheck } from '~/hooks/use-accessible-name-check';
import { cn } from '~/lib/utils';

/**
 * A `--checkbox-size` control, shared by `Checkbox` and `RadioGroupItem`. Resting: a small field, as `Input` is: the
 * surface fill (dark: a third of the field edge), a 1px `--edge-field` rim inside the box, the field's lift and lit
 * edge (`shadow-selection`); hover lays the `neutral-subtle` veil on it. Checked: the flat brand fill, no rim, no lift.
 * Focus and invalid recolor the rim, as on `Input`. Disabled: the disabled fill, no rim. The `after:` box grows the
 * target past the label gap.
 */
const selectionControlVariants = cva(
  [
    'peer relative flex size-(--checkbox-size) shrink-0 items-center justify-center bg-surface shadow-selection inset-ring inset-ring-(--edge-field) outline-none',
    // Dark: the field fill at rest only; a `dark:` fill would outrank the checked and disabled ones.
    'dark:not-data-checked:not-data-indeterminate:not-data-disabled:bg-[color-mix(in_oklab,var(--edge-field)_32%,transparent)]',
    'transition-[background-color,box-shadow,color,scale] duration-feedback',
    'after:absolute after:-inset-x-3 after:-inset-y-2',
    'not-data-disabled:hover:bg-neutral-subtle not-data-disabled:active:scale-[0.96] motion-reduce:not-data-disabled:active:scale-100',
    'focus-visible:ring-3 focus-visible:ring-ring/24 focus-visible:inset-ring-ring',
    'aria-invalid:inset-ring-destructive-border focus-visible:aria-invalid:ring-destructive/16 dark:focus-visible:aria-invalid:ring-destructive/24',
    'data-checked:bg-primary-solid data-checked:text-primary-solid-foreground data-checked:shadow-none data-checked:inset-ring-transparent',
    'not-data-disabled:data-checked:hover:bg-[color-mix(in_oklch,var(--primary-solid),black_8%)]',
    'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-none data-disabled:inset-ring-transparent',
    'data-checked:data-disabled:bg-disabled data-checked:data-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      shape: {
        square: [
          'rounded-checkbox',
          'data-indeterminate:bg-primary-solid data-indeterminate:text-primary-solid-foreground data-indeterminate:shadow-none data-indeterminate:inset-ring-transparent',
          'not-data-disabled:data-indeterminate:hover:bg-[color-mix(in_oklch,var(--primary-solid),black_8%)]',
          'data-indeterminate:data-disabled:bg-disabled data-indeterminate:data-disabled:text-disabled-foreground',
        ],
        /**
         * A 1px ring antialiases lighter on a curve than on a square, so the round rim is a stronger color
         * (`neutral-border`, 16%), not a wider ring: a fractional width (1.5px) blurs into a lopsided band in Safari at 1x.
         */
        round: 'rounded-full inset-ring-neutral-border',
      },
    },
    defaultVariants: { shape: 'square' },
  },
);

/** The check or dash, swapped in one grid cell. */
function CheckboxMark({ checked, indeterminate }: { checked: boolean; indeterminate: boolean }) {
  return (
    <>
      <IconSwap shown={indeterminate}>
        <IconMinus />
      </IconSwap>
      <DrawnCheck shown={checked && !indeterminate} />
    </>
  );
}

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  const nameCheck = useAccessibleNameCheck('Checkbox');
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      {...nameCheck}
      className={cn(selectionControlVariants({ shape: 'square' }), className)}
      {...props}>
      {/* Kept mounted so the marks inside can transition out. */}
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot='checkbox-indicator'
        className='pointer-events-none grid text-current *:col-start-1 *:row-start-1 [&_svg]:size-icon-xs'
        render={(props, state) => (
          <span {...props}>
            <CheckboxMark checked={state.checked} indeterminate={state.indeterminate} />
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, selectionControlVariants };

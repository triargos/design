import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { useAccessibleNameCheck } from '~/hooks/use-accessible-name-check';
import { cn } from '~/lib/utils';

/**
 * `scope` is structural:
 * - `self`: the focusable control itself; an open popup trigger (`aria-expanded`) shows the focus ring.
 * - `group`: an `InputGroup` wrapper; only its `[data-slot=input-group-control]` drives focus, so
 *   focusing an addon button does not ring the whole group.
 * - `within`: any other wrapper whose descendants receive focus and carry `aria-invalid`.
 */
const inputSurfaceVariants = cva(
  // Resting: a real 1px `--edge-field` border inside the box (a `--spacing-control` field measures exactly that;
  // `hit-area` grows it to 44px on touch), the light-side accent laid on
  // the border row by a full-size `::before` (`shadow-field-edge`), and a small lift (`shadow-field`). The fill stops
  // at the border (`bg-clip-padding`), so the translucent edge mixes with the surface behind. In dark the field fills
  // with a third of its edge color (white ~2.5%), one step lighter, never a hole. Focus: a `ring` border and a soft 3px
  // ring instead of the lift. Invalid: the edge turns `destructive`, no tint. Disabled: the whole field at 64% opacity,
  // no lift, no accent. Read-only (`readonly`, or Base UI's `data-readonly`): `shadow-field-flat`; it stays focusable
  // (to select and copy) but never rings. No hover style.
  [
    // `--field-radius` drives the box, the `::before` accent and `--outer-radius` (buttons and chips inside take
    // `rounded-inner` with their own `--outer-inset`). A multi-line field sets it to `--radius-area`.
    'hit-area relative rounded-(--field-radius) border border-(--edge-field) bg-surface bg-clip-padding shadow-field [--field-radius:var(--radius-control)] [--outer-radius:var(--field-radius)] dark:bg-[color-mix(in_oklab,var(--edge-field)_32%,transparent)]',
    'before:pointer-events-none before:absolute before:inset-0 before:rounded-[max(0px,calc(var(--field-radius)-1px))] before:shadow-field-edge',
    'transition-[background-color,border-color,box-shadow] duration-feedback outline-none',
  ],
  {
    variants: {
      scope: {
        self: [
          'focus-visible:border-ring focus-visible:shadow-none focus-visible:ring-3 focus-visible:ring-ring/24',
          'aria-expanded:border-ring aria-expanded:shadow-none aria-expanded:ring-3 aria-expanded:ring-ring/24',
          'aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/16 dark:focus-visible:aria-invalid:ring-destructive/24',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-64 disabled:shadow-field-flat disabled:before:shadow-none',
          '[&:is([readonly],[data-readonly])]:text-muted-foreground [&:is([readonly],[data-readonly])]:shadow-field-flat',
          '[&:is([readonly],[data-readonly])]:focus-visible:border-(--edge-field) [&:is([readonly],[data-readonly])]:focus-visible:shadow-field-flat [&:is([readonly],[data-readonly])]:focus-visible:ring-0',
        ],
        group: [
          'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/24',
          'has-[[data-slot=input-group-control][aria-expanded=true]]:border-ring has-[[data-slot=input-group-control][aria-expanded=true]]:shadow-none has-[[data-slot=input-group-control][aria-expanded=true]]:ring-3 has-[[data-slot=input-group-control][aria-expanded=true]]:ring-ring/24',
          'has-[[data-slot][aria-invalid=true]]:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'has-[[data-slot][aria-invalid=true]:focus-visible]:border-destructive/64 has-[[data-slot][aria-invalid=true]:focus-visible]:ring-destructive/16 dark:has-[[data-slot][aria-invalid=true]:focus-visible]:ring-destructive/24',
          // Only the control dims the group: a busy submit button (disabled while sending) leaves the field as is.
          'has-[[data-slot=input-group-control]:disabled]:opacity-64 has-[[data-slot=input-group-control]:disabled]:shadow-field-flat has-[[data-slot=input-group-control]:disabled]:before:shadow-none',
          'has-[[data-slot=input-group-control]:is([readonly],[data-readonly])]:text-muted-foreground has-[[data-slot=input-group-control]:is([readonly],[data-readonly])]:shadow-field-flat',
          'has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:border-(--edge-field) has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:shadow-field-flat has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:ring-0',
        ],
        within: [
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/24 focus-within:shadow-none',
          'has-aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'focus-within:has-aria-invalid:border-destructive/64 focus-within:has-aria-invalid:ring-destructive/16 dark:focus-within:has-aria-invalid:ring-destructive/24',
          // The wrapper itself may carry `aria-invalid` (`ComboboxChips`).
          'aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'focus-within:aria-invalid:border-destructive/64 focus-within:aria-invalid:ring-destructive/16 dark:focus-within:aria-invalid:ring-destructive/24',
          'has-[[readonly],[data-readonly]]:text-muted-foreground has-[[readonly],[data-readonly]]:shadow-field-flat',
          'has-[[readonly],[data-readonly]]:focus-within:border-(--edge-field) has-[[readonly],[data-readonly]]:focus-within:shadow-field-flat has-[[readonly],[data-readonly]]:focus-within:ring-0',
          'has-disabled:opacity-64 has-disabled:shadow-field-flat has-disabled:before:shadow-none',
        ],
      },
    },
    defaultVariants: {
      scope: 'self',
    },
  },
);

/**
 * `className` and `style` go to the field surface (size, layout, padding, font); every other prop, the ref included,
 * goes to the native input. A click on the surface's padding focuses the input. `type='file'`: the picker button is a
 * raised `--spacing-control-xs` chip centered in the field (`rounded-inner`), like an `InputGroupButton`; the file
 * name, or the empty note, is muted.
 */
function Input({ className, style, ...props }: React.ComponentProps<'input'>) {
  const nameCheck = useAccessibleNameCheck('Input', props.type !== 'hidden');
  return (
    <span
      data-slot='input'
      style={style}
      className={cn(
        inputSurfaceVariants({ scope: 'within' }),
        'flex h-control w-full min-w-0 cursor-text items-center px-[calc(var(--spacing-field-pad)-1px)] text-control max-md:text-[1rem]',
        // The chip's inset less the border and the input's 1px padding.
        'has-[[type=file]]:cursor-pointer has-[[type=file]]:pl-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-2px)]',
        className,
      )}
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        event.currentTarget.querySelector('input')?.focus();
      }}>
      {/* Below `sm` the field renders 16px (`max-md:text-[1rem]`), so iOS does not zoom on focus; the input inherits it. */}
      <InputPrimitive
        data-slot='input-control'
        {...nameCheck}
        className={cn(
          'h-full w-full min-w-0 flex-1 bg-transparent p-0 outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed',
          '[&[type=file]]:h-auto [&[type=file]]:p-px [&[type=file]]:cursor-pointer [&[type=file]]:text-muted-foreground [&[type=file]]:[--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)]',
          'file:me-related file:h-control-xs file:cursor-pointer file:rounded-inner file:border-0 file:bg-card file:px-(--field-chip-pad-x) file:text-caption file:font-medium file:text-foreground file:shadow-raised file:transition-shadow file:duration-feedback hover:file:shadow-raised-hover dark:file:bg-foreground/10',
        )}
        {...props}
      />
    </span>
  );
}

export { Input, inputSurfaceVariants };

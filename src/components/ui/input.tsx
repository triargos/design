import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '~/lib/utils';

const withinFocusAndInvalidSurface = [
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/24 focus-within:shadow-none',
  'has-aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
  'focus-within:has-aria-invalid:border-destructive/64 focus-within:has-aria-invalid:ring-destructive/16 dark:focus-within:has-aria-invalid:ring-destructive/24',
  // The wrapper itself may carry `aria-invalid` (`ComboboxChips` in the app forms).
  'aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
  'focus-within:aria-invalid:border-destructive/64 focus-within:aria-invalid:ring-destructive/16 dark:focus-within:aria-invalid:ring-destructive/24',
  'has-[[readonly],[data-readonly]]:text-muted-foreground has-[[readonly],[data-readonly]]:shadow-field-flat',
  'has-[[readonly],[data-readonly]]:focus-within:border-transparent has-[[readonly],[data-readonly]]:focus-within:shadow-field-flat has-[[readonly],[data-readonly]]:focus-within:ring-0',
];

/**
 * `scope` is structural:
 * - `self`: the focusable control itself; an open popup trigger (`aria-expanded`) shows the focus ring.
 * - `group`: an `InputGroup` wrapper; only its `[data-slot=input-group-control]` drives focus, so
 *   focusing an addon button does not ring the whole group.
 * - `within`: any other wrapper whose descendants receive focus and carry `aria-invalid`.
 * - `composite`: `within` for a wrapper that hosts its own controls, such as an editor toolbar; a disabled
 *   descendant (an unavailable Undo) does not dim the surface.
 */
export const inputSurfaceVariants = cva(
  // Resting: the field ring (`shadow-field`) and a small lift; the border is transparent and only carries state. In dark
  // the field is a 3% white veil over its surface, one step lighter, never a hole. Focus: a `ring` border and a soft
  // 3px ring instead of the field ring. Invalid: the field ring turns `destructive`, no tint. Read-only (`readonly`, or
  // Base UI's `data-readonly`) and disabled: `shadow-field-flat`; read-only stays focusable (to select and copy) but
  // never rings. No hover style.
  [
    // `--outer-radius`: buttons and chips inside the field take `rounded-inner` with their own `--outer-inset`.
    'rounded-control-lg border border-transparent bg-surface bg-clip-border shadow-field [--outer-radius:var(--radius-control-lg)] dark:bg-foreground/3',
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
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-field-flat',
          '[&:is([readonly],[data-readonly])]:text-muted-foreground [&:is([readonly],[data-readonly])]:shadow-field-flat',
          '[&:is([readonly],[data-readonly])]:focus-visible:border-transparent [&:is([readonly],[data-readonly])]:focus-visible:shadow-field-flat [&:is([readonly],[data-readonly])]:focus-visible:ring-0',
        ],
        group: [
          'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/24',
          'has-[[data-slot=input-group-control][aria-expanded=true]]:border-ring has-[[data-slot=input-group-control][aria-expanded=true]]:shadow-none has-[[data-slot=input-group-control][aria-expanded=true]]:ring-3 has-[[data-slot=input-group-control][aria-expanded=true]]:ring-ring/24',
          'has-[[data-slot][aria-invalid=true]]:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
          'has-[[data-slot][aria-invalid=true]:focus-visible]:border-destructive/64 has-[[data-slot][aria-invalid=true]:focus-visible]:ring-destructive/16 dark:has-[[data-slot][aria-invalid=true]:focus-visible]:ring-destructive/24',
          // Only the control dims the group: a busy submit button (disabled while sending) leaves the field as is.
          'has-[[data-slot=input-group-control]:disabled]:bg-disabled has-[[data-slot=input-group-control]:disabled]:text-disabled-foreground has-[[data-slot=input-group-control]:disabled]:shadow-field-flat',
          'has-[[data-slot=input-group-control]:is([readonly],[data-readonly])]:text-muted-foreground has-[[data-slot=input-group-control]:is([readonly],[data-readonly])]:shadow-field-flat',
          'has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:border-transparent has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:shadow-field-flat has-[[data-slot=input-group-control]:is([readonly],[data-readonly]):focus-visible]:ring-0',
        ],
        within: [
          ...withinFocusAndInvalidSurface,
          'has-disabled:bg-disabled has-disabled:text-disabled-foreground has-disabled:shadow-field-flat',
        ],
        composite: withinFocusAndInvalidSurface,
      },
    },
    defaultVariants: {
      scope: 'self',
    },
  },
);

/**
 * The native input inside a field surface. On touch it renders 16px and is scaled to the control size (`input-scale`),
 * so iOS does not zoom on focus and the field looks the same on every device. The surface owns size, padding and
 * text style; the input inherits them.
 */
export const inputControlClassName = cn(
  'input-scale h-full w-full min-w-0 flex-1 bg-transparent p-0 outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed',
  'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-control file:font-medium file:text-foreground',
);

/**
 * `className` and `style` go to the field surface (size, layout, padding, font); every other prop, the ref included,
 * goes to the native input. A click on the surface's padding focuses the input.
 */
function Input({ className, style, ...props }: React.ComponentProps<'input'>) {
  return (
    <span
      data-slot='input'
      style={style}
      className={cn(
        inputSurfaceVariants({ scope: 'within' }),
        'flex h-10 w-full min-w-0 cursor-text items-center px-3.5 text-control',
        className,
      )}
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        event.currentTarget.querySelector('input')?.focus();
      }}>
      <InputPrimitive data-slot='input-control' className={inputControlClassName} {...props} />
    </span>
  );
}

export { Input };

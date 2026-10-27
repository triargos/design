import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

/** A press on the group's own box (its padding, or the touch `hit-area` around it) focuses the control. */
function InputGroup({ className, onPointerDown, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='input-group'
      role='group'
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || event.target !== event.currentTarget) return;
        event.preventDefault();
        event.currentTarget.querySelector<HTMLElement>('[data-slot=input-group-control]')?.focus();
      }}
      className={cn(
        inputSurfaceVariants({ scope: 'group' }),
        'h-control',
        // A textarea or a block addon makes it multi-line: the area radius.
        'has-[>textarea]:[--field-radius:var(--radius-area)] has-[>[data-align=block-end]]:[--field-radius:var(--radius-area)] has-[>[data-align=block-start]]:[--field-radius:var(--radius-area)]',
        'in-data-[slot=combobox-content]:focus-within:bg-transparent in-data-[slot=combobox-content]:focus-within:ring-1 in-data-[slot=combobox-content]:focus-within:ring-border/50',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:*:data-[slot=input-group-input]:pt-field-pad has-[>[data-align=block-start]]:*:data-[slot=input-group-input]:pb-field-pad has-[>[data-align=inline-end]]:*:data-[slot=input-group-input]:pr-control-gap has-[>[data-align=inline-start]]:*:data-[slot=input-group-input]:pl-control-gap',
        'group/input-group relative flex w-full min-w-0 items-center has-[>textarea]:h-auto',
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-related py-[calc((var(--spacing-control)-var(--spacing-control-xs))/2)] text-body font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:text-disabled-foreground [&>kbd]:rounded-control-xs [&>svg:not([class*='size-'])]:size-icon",
  {
    variants: {
      align: {
        // Text and icons sit on the field's padding line (`--spacing-field-pad`). Buttons and keys sit as far from the
        // side as from the top and bottom (padding + the 1px border), inside the field's corner: `control-xs` buttons
        // centered, `rounded-inner`; a `control-2xs` `Kbd` centered, `rounded-control-xs`.
        'inline-start':
          'order-first pl-[calc(var(--spacing-field-pad)-1px)] has-[>button]:pl-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] has-[>kbd]:pl-[calc((var(--spacing-control)-var(--spacing-control-2xs))/2-1px)]',
        'inline-end':
          'order-last pr-[calc(var(--spacing-field-pad)-1px)] has-[>button]:pr-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] has-[>kbd]:pr-[calc((var(--spacing-control)-var(--spacing-control-2xs))/2-1px)]',
        'block-start':
          'order-first w-full justify-start px-[calc(var(--spacing-field-pad)-1px)] pt-field-pad-y [.border-b]:pb-field-pad-y',
        'block-end':
          'order-last w-full justify-start px-[calc(var(--spacing-field-pad)-1px)] pb-field-pad-y [.border-t]:pt-field-pad-y',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

/** A click on the addon, outside its buttons, focuses the group's input; `preventDefault()` in `onClick` stops it. */
function InputGroupAddon({
  className,
  align = 'inline-start',
  onClick,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role='group'
      data-slot='input-group-addon'
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || (event.target as Element).closest('button')) return;
        event.currentTarget.parentElement?.querySelector<HTMLElement>('[data-slot=input-group-control]')?.focus();
      }}
    />
  );
}

// Ghost's translucent hover reads on the field fill; an open popup leaves the button unfilled, since the group shows
// the open state. Radii are concentric with the field's corner (`rounded-inner`): a `control-xs` button centered in the
// `control` field, as far in on every side; the addon sets the side inset. `action` is the field's own action (test
// email, invite): a raised `control-xs` button, defaults to `type='submit'`.
const inputGroupButtonVariants = cva(
  'flex items-center gap-related text-body text-muted-foreground shadow-none aria-expanded:bg-transparent aria-expanded:text-foreground',
  {
    variants: {
      size: {
        xs: "h-control-xs gap-control-gap-sm rounded-inner px-(--field-button-pad-x) [--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)] [&>svg:not([class*='size-'])]:size-icon-sm",
        // Keeps the raised edge the ghost sizes drop: white on the white field reads only through it.
        action:
          'h-control-xs rounded-inner px-(--field-chip-pad-x) text-caption font-medium text-foreground shadow-raised [--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)]',
        'icon-xs':
          'size-control-xs rounded-inner p-0 [--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)] has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
);

function InputGroupButton({
  className,
  size = 'xs',
  type = size === 'action' ? 'submit' : 'button',
  emphasis = size === 'action' ? 'raised' : 'ghost',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      emphasis={emphasis}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='input-group-text'
      className={cn(
        "flex items-center gap-related text-body text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-icon",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The text control of an `InputGroup`: a box that takes the space between the addons and carries the padding and text
 * style (`className` goes here), around the native input (every other prop and the ref; 16px below `md`, so iOS does
 * not zoom). The group owns the surface, focus ring, invalid state and disabled fill.
 */
function InputGroupInput({ className, style, ...props }: React.ComponentProps<'input'>) {
  return (
    <span
      data-slot='input-group-input'
      style={style}
      className={cn(
        'flex h-full min-w-0 flex-1 cursor-text items-center px-[calc(var(--spacing-field-pad)-1px)] text-control max-md:text-[1rem]',
        className,
      )}>
      <InputPrimitive
        data-slot='input-group-control'
        className='h-full w-full min-w-0 flex-1 bg-transparent p-0 outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed'
        {...props}
      />
    </span>
  );
}

/**
 * The multi-line control of an `InputGroup`, bare: the group draws the surface. Pair it with a `block-start` or
 * `block-end` addon for a toolbar or a count. 16px below `md`, so iOS does not zoom.
 */
function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='input-group-control'
      className={cn(
        'flex min-h-(--textarea-min-height) w-full resize-none bg-transparent px-[calc(var(--spacing-field-pad)-1px)] py-field-pad-y text-control outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed max-md:text-[1rem]',
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
  inputGroupButtonVariants,
};

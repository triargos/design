import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { inputControlClassName, inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='input-group'
      role='group'
      className={cn(
        inputSurfaceVariants({ scope: 'group' }),
        'h-10',
        'in-data-[slot=combobox-content]:focus-within:bg-transparent in-data-[slot=combobox-content]:focus-within:ring-1 in-data-[slot=combobox-content]:focus-within:ring-border/50',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:*:data-[slot=input-group-input]:pt-3 has-[>[data-align=block-start]]:*:data-[slot=input-group-input]:pb-3 has-[>[data-align=inline-end]]:*:data-[slot=input-group-input]:pr-1.5 has-[>[data-align=inline-start]]:*:data-[slot=input-group-input]:pl-1.5',
        'group/input-group relative flex w-full min-w-0 items-center has-[>textarea]:h-auto',
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-body font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:text-disabled-foreground [&>kbd]:rounded-control-xs [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        // Text and icons sit on the field's 14px padding line. Buttons and keys sit as far from the side as from the top
        // and bottom (padding + the 1px border), inside the field's corner (`rounded-control-lg`): 24px button 8px in,
        // 32px (`action`, `icon-sm`) 4px in, both `rounded-inner`; 20px `Kbd` 10px in, 4px: concentric would be 2px, 4px is
        // the floor.
        'inline-start':
          'order-first pl-3.5 has-[>[data-size=action]]:pl-[3px] has-[>[data-size=icon-sm]]:pl-[3px] has-[>button]:pl-[7px] has-[>kbd]:pl-[9px]',
        'inline-end':
          'order-last pr-3.5 has-[>[data-size=action]]:pr-[3px] has-[>[data-size=icon-sm]]:pr-[3px] has-[>button]:pr-[7px] has-[>kbd]:pr-[9px]',
        'block-start': 'order-first w-full justify-start px-3.5 pt-2 [.border-b]:pb-2',
        'block-end': 'order-last w-full justify-start px-3.5 pb-2 [.border-t]:pt-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role='group'
      data-slot='input-group-addon'
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(event) => {
        if ((event.target as Element).closest('button')) return;
        event.currentTarget.parentElement?.querySelector('input')?.focus();
      }}
      {...props}
    />
  );
}

// Ghost's translucent hover reads on the field fill; an open popup leaves the button unfilled, since the group shows
// the open state. Radii are concentric with the field's corner (`rounded-inner`): a 24px button 8px in on every side, a
// 32px button 4px in; the addon sets the side inset. `action` is the field's own action (test email, invite): a raised
// 32px button 4px in, in the field text size; defaults to `type='submit'`.
const inputGroupButtonVariants = cva(
  'flex items-center gap-2 text-body text-muted-foreground shadow-none aria-expanded:bg-transparent aria-expanded:text-foreground',
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-inner px-1.5 [--outer-inset:--spacing(2)] [&>svg:not([class*='size-'])]:size-3.5",
        // Keeps the raised edge the ghost sizes drop: white on the white field reads only through it.
        action: 'h-8 rounded-inner px-3 text-secondary-foreground shadow-raised [--outer-inset:--spacing(1)]',
        'icon-xs': 'size-6 rounded-inner p-0 [--outer-inset:--spacing(2)] has-[>svg]:p-0',
        'icon-sm': 'size-8 rounded-inner p-0 [--outer-inset:--spacing(1)] has-[>svg]:p-0',
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
  variant,
  // Defaults only without the deprecated `variant`: `intent` and `emphasis` would override it.
  intent = variant ? undefined : 'neutral',
  emphasis = variant ? undefined : size === 'action' ? 'raised' : 'ghost',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      intent={intent}
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
        "flex items-center gap-2 text-body text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The text control of an `InputGroup`: a box that takes the space between the addons and carries the padding and text
 * style (`className` goes here), around the native input (`inputControlClassName`, every other prop and the ref). The
 * group owns the surface, focus ring, invalid state and disabled fill.
 */
function InputGroupInput({ className, style, ...props }: React.ComponentProps<'input'>) {
  return (
    <span
      data-slot='input-group-input'
      style={style}
      className={cn('flex h-full min-w-0 flex-1 cursor-text items-center px-3.5 text-control', className)}>
      <InputPrimitive data-slot='input-group-control' className={inputControlClassName} {...props} />
    </span>
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, inputGroupButtonVariants };

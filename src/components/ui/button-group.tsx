import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { Separator } from '~/components/ui/separator';

import { cn } from '~/lib/utils';

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-2xl [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>[data-slot]:has(~[data-slot])]:rounded-r-none [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0',
        vertical:
          'flex-col [&>[data-slot]:has(~[data-slot])]:rounded-b-none [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0',
      },
      radius: {
        // Buttons only: the outer ends keep the buttons' own radius; inner corners are square.
        button: '',
        // A field with its own action is an `InputGroup` with `InputGroupButton size='action'`, not a group.
        // Pill ends, for pill-shaped buttons.
        full: '',
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        radius: 'full',
        class:
          '[&>[data-slot=button]:first-child]:rounded-l-full [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-full',
      },
      {
        orientation: 'vertical',
        radius: 'full',
        class:
          '[&>[data-slot=button]:first-child]:rounded-t-full [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-full',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      radius: 'button',
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  radius,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role='group'
      data-slot='button-group'
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation, radius }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          "flex items-center gap-2 rounded-control-lg border bg-muted px-2.5 text-body font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: 'button-group-text',
    },
  });
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot='button-group-separator'
      orientation={orientation}
      className={cn(
        // Base UI sets `data-orientation` (see `Separator`).
        'relative self-stretch bg-input data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto',
        className,
      )}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants };

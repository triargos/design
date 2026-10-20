import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

const textAreaVariants = cva(
  // Multi-line, so no `input-scale`: on touch the text renders 16px, where iOS does not zoom.
  'flex min-h-[60px] w-full text-control outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground pointer-coarse:text-[1rem]',
  {
    variants: {
      variant: {
        default: [inputSurfaceVariants(), 'px-3.5 py-2.5'],
        // Bare, for an `InputGroup` that draws the surface.
        ghost: 'resize-none bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Textarea({
  className,
  variant,
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textAreaVariants>) {
  return <textarea data-slot='textarea' className={cn(textAreaVariants({ variant }), className)} {...props} />;
}

export { Textarea };

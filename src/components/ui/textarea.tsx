import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps<typeof textAreaVariants>;

const textAreaVariants = cva(
  // Multi-line, so no `input-scale`: on touch the text renders 16px, where iOS does not zoom.
  'flex min-h-[60px] w-full text-control outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground pointer-coarse:text-[1rem]',
  {
    variants: {
      variant: {
        default: [inputSurfaceVariants(), 'px-3.5 py-2.5'],
        ghost: 'resize-none bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, variant, ...props }, ref) => {
  return <textarea className={cn(textAreaVariants({ variant }), className)} ref={ref} {...props} />;
});
Textarea.displayName = 'Textarea';

export { Textarea };

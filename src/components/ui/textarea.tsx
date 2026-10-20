import type * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

/**
 * Multi-line text on the field surface; grows with `rows`. Multi-line, so no `input-scale`: on touch the text renders
 * 16px, where iOS does not zoom. Inside an `InputGroup`, use `InputGroupTextarea`.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        inputSurfaceVariants(),
        'flex min-h-[60px] w-full px-3.5 py-2.5 text-control outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground pointer-coarse:text-[1rem]',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

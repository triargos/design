import type * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

/**
 * Multi-line text on the field surface; grows with `rows`. Below `sm` the text renders 16px,
 * so iOS does not zoom. Inside an `InputGroup`, use `InputGroupTextarea`.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        inputSurfaceVariants(),
        'flex min-h-[60px] w-full px-[calc(--spacing(3)-1px)] py-2 text-control outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed max-sm:text-[1rem]',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

import type * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { useAccessibleNameCheck } from '~/hooks/use-accessible-name-check';
import { cn } from '~/lib/utils';

/**
 * Multi-line text on the field surface; grows with `rows`. Below `sm` the text renders 16px,
 * so iOS does not zoom. Inside an `InputGroup`, use `InputGroupTextarea`.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  const nameCheck = useAccessibleNameCheck('Textarea');
  return (
    <textarea
      data-slot='textarea'
      {...nameCheck}
      className={cn(
        inputSurfaceVariants(),
        '[--field-radius:var(--radius-area)]',
        'flex min-h-(--textarea-min-height) w-full px-[calc(var(--spacing-field-pad)-1px)] py-field-pad-y text-control outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed max-md:text-[1rem]',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

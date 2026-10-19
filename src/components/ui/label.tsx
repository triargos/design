import * as React from 'react';

import { cn } from '~/lib/utils';

type LabelProps = React.ComponentProps<'label'> & {
  required?: boolean;
};

function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      data-slot='label'
      className={cn(
        'flex items-center gap-2 text-body leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-disabled-foreground peer-disabled:cursor-not-allowed peer-disabled:text-disabled-foreground',
        className,
      )}
      {...props}>
      {children}
      {required && <span className='-ml-1 text-caption text-muted-foreground'>*</span>}
    </label>
  );
}

export { Label, type LabelProps };

import type { ComponentProps } from 'react';

import { cn } from '~/lib/utils';

/** A phone-sized frame for a `BottomNav`: the nav sits in the frame and stays visible at desktop width. */
export function PhoneFrame({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative h-[640px] w-[375px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50',
        '[&_[data-slot=bottom-nav]]:absolute md:[&_[data-slot=bottom-nav]]:grid',
        className,
      )}
      {...props}
    />
  );
}

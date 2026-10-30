import * as React from 'react';

import { cn } from '~/lib/utils';

/**
 * One icon of a swap: icons share a grid cell, the one that shows is `shown`. In from 25% and blurred, out the same way,
 * on the `spring` ease; CSS transitions, so a quick toggle reverses from where it is and the first render does not
 * animate. Reduced motion: a cross-fade.
 */
function IconSwap({ shown, className, ...props }: React.ComponentProps<'span'> & { shown: boolean }) {
  return (
    <span
      data-slot='icon-swap'
      className={cn(
        'grid transition-[opacity,scale,filter,visibility] duration-press ease-spring motion-reduce:duration-enter motion-reduce:ease-enter',
        !shown && 'invisible scale-25 opacity-0 blur-xs motion-reduce:scale-100 motion-reduce:blur-none',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A check that swaps in like any icon and draws its stroke from the short arm to the long one, just behind the pop. It
 * stays drawn on its way out and resets once it is gone.
 */
function DrawnCheck({ shown, className }: { shown: boolean; className?: string }) {
  return (
    <IconSwap shown={shown} className={className}>
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='tabler-icon'>
        <path
          d='M4 12l5 5L20 6'
          pathLength={1}
          className={cn(
            'transition-[stroke-dashoffset] [stroke-dasharray:1] motion-reduce:[stroke-dashoffset:0]',
            shown ? 'delay-60 duration-press ease-enter' : 'delay-300 duration-0 [stroke-dashoffset:1]',
          )}
        />
      </svg>
    </IconSwap>
  );
}

export { DrawnCheck, IconSwap };

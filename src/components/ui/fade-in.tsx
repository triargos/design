import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { cn } from '~/lib/utils';

type FadeInProps = useRender.ComponentProps<'div'> & {
  /** Off when the content was there from the first render (`useShouldFadeIn`). */
  animate?: boolean;
};

/**
 * Content that arrives after a load: it fades in over `duration-feedback` when it mounts, or when `animate` turns on.
 * Opacity only: the content lands where it stays, so nothing on the page shifts as it arrives, and reduced motion
 * needs no exception. No layout of its own: pass the gap through `className`, or `render` an element that has one.
 */
function FadeIn({ animate = true, className, render, ...props }: FadeInProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'fade-in' },
    props: mergeProps<'div'>(
      {
        className: cn(animate && 'animate-in duration-feedback ease-enter fade-in-0', className),
      },
      props,
    ),
  });
}

/**
 * Whether content behind `pending` should fade in: only when the first render was still loading, so cached or
 * prerendered data shows at once. Once it has faded in, it stays `true`, so a refetch does not replay the fade.
 */
function useShouldFadeIn(pending: boolean): boolean {
  const [startedPending] = React.useState(pending);
  const [arrived, setArrived] = React.useState(false);
  const arrivedNow = startedPending && !pending;
  if (arrivedNow && !arrived) setArrived(true);
  return arrived || arrivedNow;
}

export { FadeIn, useShouldFadeIn };

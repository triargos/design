import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';

import { cn } from '~/lib/utils';

/**
 * Starts the pulse on the document timeline, so a skeleton that mounts later pulses in step with the ones on screen.
 * Runs once per mount; the pulse itself is opacity, which the compositor animates without repainting.
 */
function syncPulse(node: HTMLElement | null) {
  for (const animation of node?.getAnimations?.() ?? []) animation.startTime = 0;
}

/**
 * A loading region in the shape of its content: the `skeleton` fill (thinned `foreground`, so it reads on any surface),
 * pulsing in opacity. A fade, so it keeps pulsing under reduced motion. `circle` for an avatar. Inside a `p`, `render={<span />}`.
 */
function Skeleton({
  className,
  circle = false,
  render,
  ref,
  ...props
}: useRender.ComponentProps<'div'> & { circle?: boolean }) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref: ref ? [ref, syncPulse] : syncPulse,
    state: { slot: 'skeleton' },
    props: mergeProps<'div'>(
      {
        className: cn('block animate-skeleton bg-skeleton', circle ? 'rounded-full' : 'rounded-control-xs', className),
      },
      props,
    ),
  });
}

export { Skeleton };

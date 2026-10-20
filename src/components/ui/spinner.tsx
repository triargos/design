import { useReducedMotion } from 'framer-motion';

import { cn } from '~/lib/utils';

interface LoaderProps {
  /** Width and height in px. */
  size?: number;
  /** Colour comes from `currentColor`: inside a button it takes the label colour; alone, set a text level. */
  className?: string;
}

/** The ring both the track and the arc are drawn on. */
const ring = { cx: '12', cy: '12', r: '9.5', fill: 'none', strokeWidth: '2', strokeLinecap: 'round' } as const;

/**
 * A growing arc on a faint track, in `currentColor`. From Cloudflare's Kumo `Spinner` (MIT, github.com/cloudflare/kumo). Decorative:
 * the busy element announces itself (`Button` sets `aria-busy`). With reduced motion it is a still arc.
 */
function Spinner({ size = 20, className }: LoaderProps) {
  const reduceMotion = useReducedMotion();
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      stroke='currentColor'
      aria-hidden='true'
      className={cn('shrink-0', className)}>
      {reduceMotion ? (
        <circle {...ring} strokeDasharray='42 150' transform='rotate(-90 12 12)' />
      ) : (
        <circle {...ring}>
          <animateTransform
            attributeName='transform'
            type='rotate'
            from='0 12 12'
            to='360 12 12'
            dur='2s'
            repeatCount='indefinite'
          />
          <animate
            attributeName='stroke-dasharray'
            values='0 150;42 150;42 150'
            keyTimes='0;0.5;1'
            dur='1.5s'
            repeatCount='indefinite'
          />
          <animate
            attributeName='stroke-dashoffset'
            values='0;-16;-59'
            keyTimes='0;0.5;1'
            dur='1.5s'
            repeatCount='indefinite'
          />
        </circle>
      )}
      <circle {...ring} opacity={0.1} />
    </svg>
  );
}

export { Spinner };

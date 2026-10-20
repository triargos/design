import { type VariantProps, cva } from 'class-variance-authority';
import { type HTMLMotionProps, type Variants, motion, useReducedMotion } from 'framer-motion';
import type * as React from 'react';

import { cn } from '~/lib/utils';

// Entry only: no bounce, short enough that the action is usable almost at once (last item settles at ~0.45s).
const spring = { type: 'spring', bounce: 0, duration: 0.3 } as const;

const containerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: spring },
};

// The back layers start hidden behind the front card and rise into place once the media has faded in, so the stack
// builds itself instead of arriving whole.
const stackLayerVariants = (rest: number): Variants => ({
  initial: { y: 0 },
  animate: { y: rest, transition: { ...spring, delay: 0.12 } },
});
const backLayerVariants = stackLayerVariants(-16);
const middleLayerVariants = stackLayerVariants(-8);

const emptyStateVariants = cva(
  'group/empty-state flex min-w-0 flex-1 flex-col items-center justify-center text-center',
  {
    variants: {
      size: {
        default: 'px-6 py-10',
        sm: 'px-4 py-6',
      },
      bordered: {
        true: 'rounded-card border border-dashed border-border',
        false: '',
      },
    },
    defaultVariants: { size: 'default', bordered: false },
  },
);

function EmptyState({
  className,
  bordered,
  size,
  variant = 'stack',
  children,
  ...props
}: { variant?: 'stack' | 'carousel'; children?: React.ReactNode } & VariantProps<typeof emptyStateVariants> &
  Omit<HTMLMotionProps<'div'>, 'children'>) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      data-slot='empty-state'
      variants={containerVariants}
      initial={reduceMotion ? false : 'initial'}
      animate='animate'
      className={cn(emptyStateVariants({ size, bordered }), className)}
      {...props}>
      <motion.div
        data-slot='empty-state-media'
        variants={itemVariants}
        className='mb-group flex w-full shrink-0 items-center justify-center'>
        {variant === 'stack' ? <EmptyStateSkeletonStack /> : <EmptyStateSkeletonCarousel />}
      </motion.div>
      {children}
    </motion.div>
  );
}

function EmptyStateTitle({ className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      data-slot='empty-state-title'
      variants={itemVariants}
      className={cn('text-heading text-balance', className)}
      {...props}
    />
  );
}

function EmptyStateDescription({ className, ...props }: HTMLMotionProps<'p'>) {
  return (
    <motion.p
      data-slot='empty-state-description'
      variants={itemVariants}
      className={cn(
        'mt-tight max-w-sm text-body text-pretty text-muted-foreground',
        '[&>a]:font-medium [&>a]:text-foreground [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateContent({ className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      data-slot='empty-state-content'
      variants={itemVariants}
      className={cn('mt-group flex min-w-0 flex-wrap items-center justify-center gap-related', className)}
      {...props}
    />
  );
}

// Skeleton cards are raised: the field edge and lift, `card` in light, a foreground tint in dark. Tints mix into `card`
// so stacked layers stay opaque.
const raisedCard = 'rounded-xl bg-card shadow-field dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_10%)]';
const skeletonFill = 'rounded-md bg-foreground/8 dark:bg-foreground/10';

// Three cards stacked front to back, each layer a step greyer. The rest offset is framer's `transform`; the hover
// spread is the separate `translate` property, so the two add up. Hover variants only apply under `(hover: hover)`, so
// a tap on touch never sticks the fan open.
function EmptyStateSkeletonStack() {
  const layer = cn(
    raisedCard,
    'absolute inset-x-0 bottom-0 h-14 transition-transform duration-move ease-move motion-reduce:transition-none',
  );
  return (
    <div aria-hidden data-slot='empty-state-skeleton-stack' className='relative h-18 w-40'>
      <motion.div
        variants={backLayerVariants}
        className={cn(
          layer,
          'scale-x-[0.84] bg-[color-mix(in_oklch,var(--card),var(--foreground)_9%)] group-hover/empty-state:-translate-y-2 dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_4%)]',
        )}
      />
      <motion.div
        variants={middleLayerVariants}
        className={cn(
          layer,
          'scale-x-[0.92] bg-[color-mix(in_oklch,var(--card),var(--foreground)_4.5%)] group-hover/empty-state:-translate-y-1 dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_7%)]',
        )}
      />
      <div className={cn(raisedCard, 'absolute inset-x-0 bottom-0 flex h-14 items-center gap-2.5 px-3')}>
        <div className='size-7 shrink-0 rounded-full bg-foreground/12 dark:bg-foreground/15' />
        <div className='flex flex-1 flex-col gap-1.5'>
          <div className={cn(skeletonFill, 'h-2.5 w-3/4')} />
          <div className={cn(skeletonFill, 'h-2.5 w-1/2')} />
        </div>
      </div>
    </div>
  );
}

// The track renders its card set twice and the keyframe slides by -50%, so spacing must come from each card's margin
// (not flex gap) and the set must stay at exactly 3 cards: the step percentages in `skeleton-carousel` assume it.
const carouselCards = [
  { title: 'w-3/4', line: 'w-1/2' },
  { title: 'w-2/3', line: 'w-3/4' },
  { title: 'w-4/5', line: 'w-2/5' },
];
const carouselEdgeFade = 'linear-gradient(to right, transparent, #000 20%, #000 80%, transparent)';

function EmptyStateSkeletonCarousel() {
  return (
    <div
      aria-hidden
      data-slot='empty-state-skeleton-carousel'
      style={{ maskImage: carouselEdgeFade, WebkitMaskImage: carouselEdgeFade }}
      className='w-xl max-w-full overflow-hidden py-2'>
      <div
        // Pin the loop to the page timeline so every carousel on screen runs in phase, no matter when it mounted.
        ref={(track) => {
          track?.style.setProperty('animation-delay', `-${performance.now()}ms`);
        }}
        className='flex w-max animate-skeleton-carousel motion-reduce:animate-none'>
        {[...carouselCards, ...carouselCards].map((card, index) => (
          <div key={index} className={cn(raisedCard, 'mr-3 w-52 shrink-0 p-3')}>
            <div className={cn(skeletonFill, 'h-14 rounded-lg')} />
            <div className={cn(skeletonFill, 'mt-2.5 h-2.5', card.title)} />
            <div className={cn(skeletonFill, 'mt-1.5 h-2.5', card.line)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export { EmptyState, EmptyStateTitle, EmptyStateDescription, EmptyStateContent };

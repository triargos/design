import { type VariantProps, cva } from 'class-variance-authority';
import { type HTMLMotionProps, type Variants, LazyMotion, m, useReducedMotion } from 'framer-motion';

import { loadMotionFeatures } from '~/lib/motion/load';
import { cn } from '~/lib/utils';

// Entry only: no bounce. Four parts 100ms apart, so the last (the action) settles at ~0.6s and is usable almost at
// once.
const spring = { type: 'spring', bounce: 0, duration: 0.3 } as const;

const containerMotion: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
};

const itemMotion: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: spring },
};

// The back layers start hidden behind the front card and rise into place once the media has faded in, so the stack
// builds itself instead of arriving whole.
const layerMotion = (rest: number): Variants => ({
  initial: { y: 0 },
  animate: { y: rest, transition: { ...spring, delay: 0.12 } },
});

const emptyVariants = cva('group/empty flex min-w-0 flex-1 flex-col items-center justify-center text-center', {
  variants: {
    size: {
      default: 'px-(--empty-pad-x) py-(--empty-pad-y)',
      sm: 'px-(--empty-pad-x-sm) py-(--empty-pad-y-sm)',
    },
    bordered: {
      true: 'rounded-card border border-dashed border-border',
      false: '',
    },
  },
  defaultVariants: { size: 'default', bordered: false },
});

/**
 * Nothing to show, or something failed: `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` (the next
 * step), centered. The parts rise in one after another. A failure is an `Empty` with `role='alert'` and an icon.
 */
function Empty({ className, bordered, size, ...props }: VariantProps<typeof emptyVariants> & HTMLMotionProps<'div'>) {
  const reduceMotion = useReducedMotion();
  return (
    <LazyMotion features={loadMotionFeatures}>
      <m.div
        data-slot='empty'
        variants={containerMotion}
        initial={reduceMotion ? false : 'initial'}
        animate='animate'
        className={cn(emptyVariants({ size, bordered }), className)}
        {...props}
      />
    </LazyMotion>
  );
}

const emptyMediaVariants = cva('flex shrink-0 items-center justify-center', {
  variants: {
    variant: {
      /** Three skeleton cards stacked front to back; they fan out on hover. */
      skeleton: 'mb-group w-full',
      /** One icon on a quiet tile. */
      icon: "mb-part size-control-lg rounded-control-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-icon-lg",
    },
  },
  defaultVariants: { variant: 'skeleton' },
});

function EmptyMedia({
  className,
  variant = 'skeleton',
  children,
  ...props
}: VariantProps<typeof emptyMediaVariants> & HTMLMotionProps<'div'>) {
  return (
    <m.div
      aria-hidden
      data-slot='empty-media'
      data-variant={variant}
      variants={itemMotion}
      className={cn(emptyMediaVariants({ variant }), className)}
      {...props}>
      {variant === 'skeleton' ? <SkeletonStack /> : children}
    </m.div>
  );
}

// Each layer a step greyer, mixed into `card` so stacked layers stay opaque; a foreground tint in dark. The rest offset
// is framer's `transform`; the hover spread is the separate `translate` property, so the two add up. Hover variants
// only apply under `(hover: hover)`, so a tap on touch never sticks the fan open.
function SkeletonStack() {
  return (
    <div className='relative h-18 w-40'>
      <m.div
        variants={layerMotion(-16)}
        className='absolute inset-x-0 bottom-0 h-14 scale-x-[0.84] rounded-block border border-(--edge-field) bg-clip-padding bg-[color-mix(in_oklch,var(--card),var(--foreground)_9%)] shadow-field transition-transform duration-move ease-move group-hover/empty:-translate-y-2 motion-reduce:transition-none dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_4%)]'
      />
      <m.div
        variants={layerMotion(-8)}
        className='absolute inset-x-0 bottom-0 h-14 scale-x-[0.92] rounded-block border border-(--edge-field) bg-clip-padding bg-[color-mix(in_oklch,var(--card),var(--foreground)_4.5%)] shadow-field transition-transform duration-move ease-move group-hover/empty:-translate-y-1 motion-reduce:transition-none dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_7%)]'
      />
      <div className='absolute inset-x-0 bottom-0 flex h-14 items-center gap-2.5 rounded-block border border-(--edge-field) bg-card bg-clip-padding px-3 shadow-field dark:bg-[color-mix(in_oklch,var(--card),var(--foreground)_10%)]'>
        <div className='size-7 shrink-0 rounded-full bg-foreground/12 dark:bg-foreground/15' />
        <div className='flex flex-1 flex-col gap-1.5'>
          <div className='h-2.5 w-3/4 rounded-full bg-foreground/8 dark:bg-foreground/10' />
          <div className='h-2.5 w-1/2 rounded-full bg-foreground/8 dark:bg-foreground/10' />
        </div>
      </div>
    </div>
  );
}

function EmptyTitle({ className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <m.div
      data-slot='empty-title'
      variants={itemMotion}
      className={cn('text-heading text-balance', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: HTMLMotionProps<'p'>) {
  return (
    <m.p
      data-slot='empty-description'
      variants={itemMotion}
      className={cn(
        'mt-tight max-w-sm text-body text-pretty text-muted-foreground',
        '[&>a]:font-medium [&>a]:text-foreground [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

/** The next step: one or two buttons. Every failure offers at least one. */
function EmptyContent({ className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <m.div
      data-slot='empty-content'
      variants={itemMotion}
      className={cn('mt-group flex min-w-0 flex-wrap items-center justify-center gap-related', className)}
      {...props}
    />
  );
}

export { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle };

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import * as React from 'react';

import { cn } from '~/lib/utils';

// A quiet neutral fill with muted initials and a hairline inside the box. Groups cut each avatar out of the next one
// with a mask instead of a surface-colored ring, so they read on any surface.

type AvatarSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type AvatarShape = 'circle' | 'square';

/**
 * Per size: the box, the group count's box, the initials (below the caption role, 12px, they scale with the box like an
 * icon), the `square` radius, and in a group the cut around the next avatar (`--avatar-gap`) and how far each one slides
 * under the previous (`--avatar-overlap`).
 */
const avatarSizes = {
  xxs: {
    box: 'size-3',
    count: 'h-3 min-w-3',
    text: 'text-[0.5rem]/3',
    square: 'rounded-xs',
    group: '[--avatar-gap:1px] [--avatar-overlap:--spacing(1)]',
  },
  xs: {
    box: 'size-4',
    count: 'h-4 min-w-4',
    text: 'text-[0.5rem]/3',
    square: 'rounded-xs',
    group: '[--avatar-gap:1px] [--avatar-overlap:--spacing(1.5)]',
  },
  sm: {
    box: 'size-5',
    count: 'h-5 min-w-5',
    text: 'text-[0.5rem]/3',
    square: 'rounded-sm',
    group: '[--avatar-gap:1px] [--avatar-overlap:--spacing(1)]',
  },
  md: {
    box: 'size-6',
    count: 'h-6 min-w-6',
    text: 'text-[0.625rem]/3.5',
    square: 'rounded-sm',
    group: '[--avatar-gap:1px] [--avatar-overlap:--spacing(1)]',
  },
  lg: {
    box: 'size-7',
    count: 'h-7 min-w-7',
    text: 'text-caption',
    square: 'rounded-md',
    group: '[--avatar-gap:2px] [--avatar-overlap:--spacing(1)]',
  },
  xl: {
    box: 'size-8',
    count: 'h-8 min-w-8',
    text: 'text-caption',
    square: 'rounded-lg',
    group: '[--avatar-gap:2px] [--avatar-overlap:--spacing(1)]',
  },
  '2xl': {
    box: 'size-10',
    count: 'h-10 min-w-10',
    text: 'text-body',
    square: 'rounded-xl',
    group: '[--avatar-gap:2px] [--avatar-overlap:--spacing(1.5)]',
  },
  '3xl': {
    box: 'size-12',
    count: 'h-12 min-w-12',
    text: 'text-heading',
    square: 'rounded-xl',
    group: '[--avatar-gap:3px] [--avatar-overlap:--spacing(1.5)]',
  },
  '4xl': {
    box: 'size-20',
    count: 'h-20 min-w-20',
    text: 'text-title',
    square: 'rounded-2xl',
    group: '[--avatar-gap:4px] [--avatar-overlap:--spacing(2)]',
  },
} satisfies Record<AvatarSize, { box: string; count: string; text: string; square: string; group: string }>;

const avatarRadius = (shape: AvatarShape, size: AvatarSize) =>
  shape === 'circle' ? 'rounded-full' : avatarSizes[size].square;

// The hairline is a 1px translucent inset ring on a layer above the photo, not a 0.5px outline: sub-pixel outlines snap
// to whole device pixels unevenly around a curve and look jagged at 1x.
const avatarSurface = cn(
  'relative flex shrink-0 items-center justify-center bg-muted font-medium text-muted-foreground select-none',
  'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-foreground/10',
);

const AvatarGroupContext = React.createContext<{ size?: AvatarSize; shape?: AvatarShape }>({});

function Avatar({
  className,
  size: sizeProp,
  shape: shapeProp,
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: AvatarSize;
  shape?: AvatarShape;
}) {
  const group = React.use(AvatarGroupContext);
  const size = sizeProp ?? group.size ?? 'md';
  const shape = shapeProp ?? group.shape ?? 'circle';
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      data-size={size}
      data-shape={shape}
      // Size classes stay plain, not `data-[size=…]:` variants, so a caller's `size-*` in `className` overrides them.
      className={cn(
        'group/avatar',
        avatarSurface,
        avatarSizes[size].box,
        avatarSizes[size].text,
        avatarRadius(shape, size),
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      className={cn('aspect-square size-full rounded-[inherit] object-cover', className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn('flex size-full items-center justify-center rounded-[inherit]', className)}
      {...props}
    />
  );
}

/** A status dot on the bottom-end edge, 30% of the avatar; its icon shows from `lg` (28px) up. */
function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='avatar-badge'
      className={cn(
        'absolute end-0 bottom-0 z-10 inline-flex size-[30%] min-w-1.5 items-center justify-center rounded-full bg-primary-solid text-primary-solid-foreground ring-2 ring-background select-none',
        '[&>svg]:size-[70%] [&>svg]:stroke-3',
        'group-data-[size=md]/avatar:[&>svg]:hidden group-data-[size=sm]/avatar:[&>svg]:hidden group-data-[size=xs]/avatar:[&>svg]:hidden group-data-[size=xxs]/avatar:[&>svg]:hidden',
        className,
      )}
      {...props}
    />
  );
}

const avatarGroupShape = [
  'group/avatar-group flex items-center',
  '[--avatar-cutout-x:calc(150%_-_var(--avatar-overlap))] rtl:[--avatar-cutout-x:calc(-50%_+_var(--avatar-overlap))]',
  '[--avatar-cutout-direction:to_right] rtl:[--avatar-cutout-direction:to_left]',
  '*:not-first:-ms-(--avatar-overlap)',
  '*:not-last:[mask-image:radial-gradient(ellipse_calc(50%_+_var(--avatar-gap))_calc(50%_+_var(--avatar-gap))_at_var(--avatar-cutout-x)_50%,transparent_calc(100%_-_0.5px),#000_100%)]',
  'data-[shape=square]:*:not-last:[mask-image:linear-gradient(var(--avatar-cutout-direction),#000_calc(100%_-_var(--avatar-overlap)_-_var(--avatar-gap)_-_0.5px),transparent_calc(100%_-_var(--avatar-overlap)_-_var(--avatar-gap)))]',
];

/** Overlapping avatars; `size` and `shape` apply to every `Avatar` and the `AvatarGroupCount` inside. */
function AvatarGroup({
  className,
  size = 'md',
  shape = 'circle',
  ...props
}: React.ComponentProps<'div'> & { size?: AvatarSize; shape?: AvatarShape }) {
  return (
    <AvatarGroupContext value={{ size, shape }}>
      <div
        data-slot='avatar-group'
        data-size={size}
        data-shape={shape}
        className={cn(avatarGroupShape, avatarSizes[size].group, className)}
        {...props}
      />
    </AvatarGroupContext>
  );
}

/** The rest of a group as a count (`+5`): an avatar-high pill that widens with the number. */
function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  const { size = 'md', shape = 'circle' } = React.use(AvatarGroupContext);
  return (
    <div
      data-slot='avatar-group-count'
      className={cn(
        avatarSurface,
        'px-1 tabular-nums',
        avatarSizes[size].count,
        avatarSizes[size].text,
        avatarRadius(shape, size),
        className,
      )}
      {...props}
    />
  );
}

/** First letter of the first and last word: `Anna-Lena von Müller` → `AM`. */
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  const first = words[0] ?? '';
  const last = words.length > 1 ? (words.at(-1) ?? '') : '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge, getInitials };
export type { AvatarSize, AvatarShape };

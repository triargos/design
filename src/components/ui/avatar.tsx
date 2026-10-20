import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '~/lib/utils';

// A quiet neutral fill with muted initials and a hairline inside the box. Groups cut each avatar out of the next one
// with a mask instead of a surface-colored ring, so they read on any surface.

type AvatarSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type AvatarShape = 'circle' | 'square';

/**
 * An avatar, or a group's count (`part='count'`, a pill that widens with the number). Per size: the box, the initials
 * (below the caption role, 12px, they scale with the box like an icon) and the `square` radius. Size classes are plain,
 * not `data-[size=…]:` variants, so a caller's `size-*` in `className` overrides them. The hairline is a 1px
 * translucent inset ring on a layer above the photo, not a 0.5px outline: sub-pixel outlines snap to whole device
 * pixels unevenly around a curve and look jagged at 1x.
 */
const avatarVariants = cva(
  [
    'relative flex shrink-0 items-center justify-center bg-muted font-medium text-muted-foreground select-none',
    'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-foreground/10',
  ],
  {
    variants: {
      size: {
        xxs: 'text-[0.5rem]/3',
        xs: 'text-[0.5rem]/3',
        sm: 'text-[0.5rem]/3',
        md: 'text-[0.625rem]/3.5',
        lg: 'text-caption',
        xl: 'text-caption',
        '2xl': 'text-body',
        '3xl': 'text-heading',
        '4xl': 'text-title',
      },
      shape: { circle: 'rounded-full', square: '' },
      part: { avatar: 'group/avatar', count: 'px-1 tabular-nums' },
    },
    compoundVariants: [
      { part: 'avatar', size: 'xxs', className: 'size-3' },
      { part: 'count', size: 'xxs', className: 'h-3 min-w-3' },
      { part: 'avatar', size: 'xs', className: 'size-4' },
      { part: 'count', size: 'xs', className: 'h-4 min-w-4' },
      { part: 'avatar', size: 'sm', className: 'size-5' },
      { part: 'count', size: 'sm', className: 'h-5 min-w-5' },
      { part: 'avatar', size: 'md', className: 'size-6' },
      { part: 'count', size: 'md', className: 'h-6 min-w-6' },
      { part: 'avatar', size: 'lg', className: 'size-7' },
      { part: 'count', size: 'lg', className: 'h-7 min-w-7' },
      { part: 'avatar', size: 'xl', className: 'size-8' },
      { part: 'count', size: 'xl', className: 'h-8 min-w-8' },
      { part: 'avatar', size: '2xl', className: 'size-10' },
      { part: 'count', size: '2xl', className: 'h-10 min-w-10' },
      { part: 'avatar', size: '3xl', className: 'size-12' },
      { part: 'count', size: '3xl', className: 'h-12 min-w-12' },
      { part: 'avatar', size: '4xl', className: 'size-20' },
      { part: 'count', size: '4xl', className: 'h-20 min-w-20' },
      { shape: 'square', size: 'xxs', className: 'rounded-xs' },
      { shape: 'square', size: 'xs', className: 'rounded-xs' },
      { shape: 'square', size: 'sm', className: 'rounded-sm' },
      { shape: 'square', size: 'md', className: 'rounded-sm' },
      { shape: 'square', size: 'lg', className: 'rounded-md' },
      { shape: 'square', size: 'xl', className: 'rounded-lg' },
      { shape: 'square', size: '2xl', className: 'rounded-xl' },
      { shape: 'square', size: '3xl', className: 'rounded-xl' },
      { shape: 'square', size: '4xl', className: 'rounded-2xl' },
    ],
    defaultVariants: { size: 'md', shape: 'circle', part: 'avatar' },
  },
);

/**
 * Each avatar slides under the previous one (`--avatar-overlap`) and is cut out around the next (`--avatar-gap`): a
 * radial mask for circles, a linear one for squares. The circle's radius is a pure length (half of `--avatar-size`
 * plus the gap): Chromium drops a `radial-gradient` whose size mixes `%` and `px` in `calc()`.
 */
const avatarGroupVariants = cva(
  [
    'group/avatar-group flex items-center',
    '[--avatar-cutout-x:calc(150%_-_var(--avatar-overlap))] rtl:[--avatar-cutout-x:calc(-50%_+_var(--avatar-overlap))]',
    '[--avatar-cutout-direction:to_right] rtl:[--avatar-cutout-direction:to_left]',
    '*:not-first:-ms-(--avatar-overlap)',
  ],
  {
    variants: {
      size: {
        xxs: '[--avatar-size:--spacing(3)] [--avatar-gap:1px] [--avatar-overlap:--spacing(1)]',
        xs: '[--avatar-size:--spacing(4)] [--avatar-gap:1px] [--avatar-overlap:--spacing(1.5)]',
        sm: '[--avatar-size:--spacing(5)] [--avatar-gap:1px] [--avatar-overlap:--spacing(1)]',
        md: '[--avatar-size:--spacing(6)] [--avatar-gap:1px] [--avatar-overlap:--spacing(1)]',
        lg: '[--avatar-size:--spacing(7)] [--avatar-gap:2px] [--avatar-overlap:--spacing(1)]',
        xl: '[--avatar-size:--spacing(8)] [--avatar-gap:2px] [--avatar-overlap:--spacing(1)]',
        '2xl': '[--avatar-size:--spacing(10)] [--avatar-gap:2px] [--avatar-overlap:--spacing(1.5)]',
        '3xl': '[--avatar-size:--spacing(12)] [--avatar-gap:3px] [--avatar-overlap:--spacing(1.5)]',
        '4xl': '[--avatar-size:--spacing(20)] [--avatar-gap:4px] [--avatar-overlap:--spacing(2)]',
      },
      shape: {
        circle:
          '*:not-last:[mask-image:radial-gradient(circle_calc(var(--avatar-size)/2_+_var(--avatar-gap))_at_var(--avatar-cutout-x)_50%,transparent_calc(100%_-_0.5px),#000_100%)]',
        square:
          '*:not-last:[mask-image:linear-gradient(var(--avatar-cutout-direction),#000_calc(100%_-_var(--avatar-overlap)_-_var(--avatar-gap)_-_0.5px),transparent_calc(100%_-_var(--avatar-overlap)_-_var(--avatar-gap)))]',
      },
    },
    defaultVariants: { size: 'md', shape: 'circle' },
  },
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
      className={cn(avatarVariants({ size, shape }), className)}
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
        className={cn(avatarGroupVariants({ size, shape }), className)}
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
      className={cn(avatarVariants({ size, shape, part: 'count' }), className)}
      {...props}
    />
  );
}

/** First letter of the first and last word: `Mary-Kate van der Berg` → `MB`. */
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  const first = words[0] ?? '';
  const last = words.length > 1 ? (words.at(-1) ?? '') : '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge, getInitials };
export type { AvatarSize, AvatarShape };

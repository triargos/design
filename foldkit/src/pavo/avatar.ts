import { cva } from 'class-variance-authority';
import { Array, String as Str } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child, PartConfig } from './part.ts';

export type AvatarSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type AvatarShape = 'circle' | 'square';

const avatarVariants = cva(
  [
    'relative flex shrink-0 items-center justify-center bg-muted font-medium text-muted-foreground select-none',
    'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-image-edge',
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

export type AvatarImage<Message> = Readonly<{
  src: string;
  alt: string;
  isFailed?: boolean | undefined;
  onError?: Message | undefined;
}>;

export type AvatarContent<Message> = Readonly<{
  image?: AvatarImage<Message> | undefined;
  fallback?: ReadonlyArray<Child> | undefined;
  badge?: ReadonlyArray<Child> | undefined;
}>;

export type ViewConfig<Message> = Omit<PartConfig<Message>, 'children'> &
  AvatarContent<Message> &
  Readonly<{
    size?: AvatarSize | undefined;
    shape?: AvatarShape | undefined;
  }>;

const imageView = <Message>({ src, alt, onError }: AvatarImage<Message>, h: HtmlBuilder<Message>): Html =>
  h.img([
    h.Src(src),
    h.Alt(alt),
    ...(onError === undefined ? [] : [h.OnError(onError)]),
    h.DataAttribute('slot', 'avatar-image'),
    h.Class('absolute inset-0 aspect-square size-full rounded-[inherit] object-cover text-transparent'),
  ]);

const fallbackView = <Message>(children: ReadonlyArray<Child>, h: HtmlBuilder<Message>): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'avatar-fallback'),
      h.Class('flex size-full items-center justify-center rounded-[inherit]'),
    ],
    children,
  );

const badgeView = <Message>(children: ReadonlyArray<Child>, h: HtmlBuilder<Message>): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'avatar-badge'),
      h.Class(
        cn(
          'absolute end-0 bottom-0 z-10 inline-flex size-[30%] min-w-1.5 items-center justify-center rounded-full bg-primary-solid text-primary-solid-foreground ring-2 ring-surface select-none',
          '[&>svg]:size-[70%]',
          'group-data-[size=md]/avatar:[&>svg]:hidden group-data-[size=sm]/avatar:[&>svg]:hidden group-data-[size=xs]/avatar:[&>svg]:hidden group-data-[size=xxs]/avatar:[&>svg]:hidden',
        ),
      ),
    ],
    children,
  );

export const view = <Message>(
  { size = 'md', shape = 'circle', image, fallback, badge, className, attributes = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'avatar'),
      h.DataAttribute('size', size),
      h.DataAttribute('shape', shape),
      h.Class(cn(avatarVariants({ size, shape }), className)),
      ...attributes,
    ],
    [
      ...(fallback === undefined ? [] : [fallbackView(fallback, h)]),
      ...(image === undefined || image.isFailed === true ? [] : [imageView(image, h)]),
      ...(badge === undefined ? [] : [badgeView(badge, h)]),
    ],
  );

export type GroupConfig<Message> = Omit<PartConfig<Message>, 'children'> &
  Readonly<{
    size?: AvatarSize | undefined;
    shape?: AvatarShape | undefined;
    avatars: ReadonlyArray<AvatarContent<Message>>;
    count?: string | undefined;
  }>;

export const group = <Message>(
  { size = 'md', shape = 'circle', avatars, count, className, attributes = [] }: GroupConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'avatar-group'),
      h.DataAttribute('size', size),
      h.DataAttribute('shape', shape),
      h.Class(cn(avatarGroupVariants({ size, shape }), className)),
      ...attributes,
    ],
    [
      ...avatars.map((avatar) => view({ ...avatar, size, shape }, h)),
      ...(count === undefined
        ? []
        : [
            h.div(
              [h.DataAttribute('slot', 'avatar-group-count'), h.Class(avatarVariants({ size, shape, part: 'count' }))],
              [count],
            ),
          ]),
    ],
  );

export const initials = (name: string): string => {
  const words = Str.split(Str.trim(name), /\s+/);
  const first = Array.headNonEmpty(words);
  const last = words.length > 1 ? Array.lastNonEmpty(words) : '';
  return Str.toUpperCase(first.charAt(0) + last.charAt(0));
};

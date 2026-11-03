import { cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import { dataColorStyle, type Emphasis, type Intent, intentVariants } from './intent.ts';
import type { PartConfig } from './part.ts';

const badgeShape = cva(
  'inline-flex shrink-0 items-center justify-center gap-control-gap-sm font-medium whitespace-nowrap',
  {
    variants: {
      size: {
        default: "h-(--badge-height) px-(--badge-pad-x) text-caption [&_svg:not([class*='size-'])]:size-icon-sm",
        sm: "h-(--badge-height-sm) px-(--badge-pad-x-sm) text-caption [&_svg:not([class*='size-'])]:size-icon-xs",
      },
      shape: {
        rounded: 'rounded-control-sm',
        pill: 'rounded-full',
      },
    },
  },
);

export type BadgeEmphasis = Extract<Emphasis, 'solid' | 'subtle' | 'outline'>;
export type BadgeSize = 'default' | 'sm';
export type BadgeShape = 'rounded' | 'pill';

export type BadgeStyle = Readonly<{
  intent?: Intent | undefined;
  color?: string | undefined;
  emphasis?: BadgeEmphasis | undefined;
  size?: BadgeSize | undefined;
  shape?: BadgeShape | undefined;
  className?: string | undefined;
}>;

const badgeVariants = ({
  intent = 'neutral',
  color,
  emphasis = 'subtle',
  size = 'default',
  shape = 'rounded',
  className,
}: BadgeStyle = {}): string =>
  cn(
    intentVariants({ intent: color === undefined ? intent : 'data', emphasis }),
    badgeShape({ size, shape }),
    className,
  );

export type ViewConfig<Message> = PartConfig<Message> &
  BadgeStyle &
  Readonly<{
    href?: string | undefined;
  }>;

export const view = <Message>(config: ViewConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const { href, color, attributes = [], children = [] } = config;
  const badgeAttributes = [
    h.DataAttribute('slot', 'badge'),
    h.Class(badgeVariants(config)),
    ...(color === undefined ? [] : [h.Style(dataColorStyle(color))]),
    ...attributes,
  ];
  return href === undefined ? h.span(badgeAttributes, children) : h.a([h.Href(href), ...badgeAttributes], children);
};

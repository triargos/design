import { type Html, inertHtml as ih } from 'foldkit/html';

import { cn } from './cn.ts';
import { ICON_NODES } from './icons.generated.ts';

export type IconName = keyof typeof ICON_NODES;

type IconNode = readonly [string, Readonly<Record<string, string>>];

const ICON_ELEMENTS = {
  path: ih.path,
  circle: ih.circle,
  rect: ih.rect,
  line: ih.line,
  polyline: ih.polyline,
  polygon: ih.polygon,
  ellipse: ih.ellipse,
} as const;

const isIconElement = (tag: string): tag is keyof typeof ICON_ELEMENTS => tag in ICON_ELEMENTS;

const iconChild = ([tag, attributes]: IconNode): Html =>
  isIconElement(tag)
    ? ICON_ELEMENTS[tag](Object.entries(attributes).map(([key, value]) => ih.Attribute(key, value)))
    : null;

export type IconConfig = Readonly<{
  className?: string;
  dataIcon?: 'inline-start' | 'inline-end';
  dataSlot?: string;
  ariaLabel?: string;
}>;

export const icon = (name: IconName, config: IconConfig = {}): Html => {
  const { className, dataIcon, dataSlot, ariaLabel } = config;
  const nodes: ReadonlyArray<IconNode> = ICON_NODES[name];
  return ih.svg(
    [
      ih.Xmlns('http://www.w3.org/2000/svg'),
      ih.Attribute('width', '24'),
      ih.Attribute('height', '24'),
      ih.ViewBox('0 0 24 24'),
      ih.Fill('none'),
      ih.Stroke('currentColor'),
      ih.StrokeLinecap('round'),
      ih.StrokeLinejoin('round'),
      ih.Attribute('stroke-width', '2'),
      ih.Class(cn('tabler-icon', `tabler-icon-${String(name)}`, className)),
      ...(dataIcon === undefined ? [] : [ih.DataAttribute('icon', dataIcon)]),
      ...(dataSlot === undefined ? [] : [ih.DataAttribute('slot', dataSlot)]),
      ...(ariaLabel === undefined ? [ih.AriaHidden(true)] : [ih.Role('img'), ih.AriaLabel(ariaLabel)]),
    ],
    nodes.map(iconChild),
  );
};

import { type Html, inertHtml as ih } from 'foldkit/html';

import { cn } from './cn.ts';

const DEFAULT_SIZE = 20;

export type SpinnerConfig = Readonly<{
  size?: number;
  className?: string;
}>;

const ringAttributes = () => [
  ih.Cx('12'),
  ih.Cy('12'),
  ih.R('9.5'),
  ih.Fill('none'),
  ih.Attribute('stroke-width', '2'),
  ih.StrokeLinecap('round'),
];

export const view = ({ size = DEFAULT_SIZE, className }: SpinnerConfig = {}): Html =>
  ih.svg(
    [
      ih.Attribute('width', String(size)),
      ih.Attribute('height', String(size)),
      ih.ViewBox('0 0 24 24'),
      ih.Xmlns('http://www.w3.org/2000/svg'),
      ih.Stroke('currentColor'),
      ih.AriaHidden(true),
      ih.Class(cn('shrink-0', className)),
    ],
    [
      ih.circle([
        ...ringAttributes(),
        ih.Attribute('stroke-dasharray', '42 150'),
        ih.Attribute('transform', 'rotate(-90 12 12)'),
        ih.Class('motion-safe:hidden'),
      ]),
      ih.circle(
        [...ringAttributes(), ih.Class('motion-reduce:hidden')],
        [
          ih.animateTransform([
            ih.Attribute('attributeName', 'transform'),
            ih.Attribute('type', 'rotate'),
            ih.Attribute('from', '0 12 12'),
            ih.Attribute('to', '360 12 12'),
            ih.Attribute('dur', '2s'),
            ih.Attribute('repeatCount', 'indefinite'),
          ]),
          ih.animate([
            ih.Attribute('attributeName', 'stroke-dasharray'),
            ih.Attribute('values', '0 150;42 150;42 150'),
            ih.Attribute('keyTimes', '0;0.5;1'),
            ih.Attribute('dur', '1.5s'),
            ih.Attribute('repeatCount', 'indefinite'),
          ]),
          ih.animate([
            ih.Attribute('attributeName', 'stroke-dashoffset'),
            ih.Attribute('values', '0;-16;-59'),
            ih.Attribute('keyTimes', '0;0.5;1'),
            ih.Attribute('dur', '1.5s'),
            ih.Attribute('repeatCount', 'indefinite'),
          ]),
        ],
      ),
      ih.circle([...ringAttributes(), ih.Attribute('opacity', '0.1')]),
    ],
  );

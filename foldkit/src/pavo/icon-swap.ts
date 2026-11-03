import { type Html, inertHtml as ih } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child } from './part.ts';

export type ViewConfig = Readonly<{
  isShown: boolean;
  className?: string | undefined;
  children?: ReadonlyArray<Child>;
}>;

export const view = ({ isShown, className, children = [] }: ViewConfig): Html =>
  ih.span(
    [
      ih.DataAttribute('slot', 'icon-swap'),
      ih.Class(
        cn(
          'grid transition-[opacity,scale,filter,visibility] duration-press ease-spring motion-reduce:duration-enter motion-reduce:ease-enter',
          !isShown && 'invisible scale-25 opacity-0 blur-xs motion-reduce:scale-100 motion-reduce:blur-none',
          className,
        ),
      ),
    ],
    children,
  );

export type DrawnCheckConfig = Readonly<{ isShown: boolean; className?: string | undefined }>;

export const drawnCheck = ({ isShown, className }: DrawnCheckConfig): Html =>
  view({
    isShown,
    className,
    children: [
      ih.svg(
        [
          ih.ViewBox('0 0 24 24'),
          ih.Fill('none'),
          ih.Stroke('currentColor'),
          ih.StrokeLinecap('round'),
          ih.StrokeLinejoin('round'),
          ih.AriaHidden(true),
          ih.Class('tabler-icon'),
        ],
        [
          ih.path([
            ih.D('M4 12l5 5L20 6'),
            ih.PathLength('1'),
            ih.Class(
              cn(
                'transition-[stroke-dashoffset] [stroke-dasharray:1] motion-reduce:[stroke-dashoffset:0]',
                isShown ? 'delay-60 duration-press ease-enter' : 'delay-300 duration-0 [stroke-dashoffset:1]',
              ),
            ),
          ]),
        ],
      ),
    ],
  });

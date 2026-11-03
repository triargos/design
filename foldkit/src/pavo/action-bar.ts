import { Array, Option, pipe } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child } from './part.ts';

export type OpenBar = Readonly<{ id: string; priority: number; isOpen: boolean }>;

export const topmost = (bars: ReadonlyArray<OpenBar>): Option.Option<string> =>
  pipe(
    bars,
    Array.filter(({ isOpen }) => isOpen),
    Array.reduce(Option.none<OpenBar>(), (maybeShown, bar) =>
      Option.match(maybeShown, {
        onNone: () => Option.some(bar),
        onSome: (shown) => Option.some(shown.priority > bar.priority ? shown : bar),
      }),
    ),
    Option.map(({ id }) => id),
  );

export type ViewConfig = Readonly<{
  isOpen: boolean;
  ariaLabel: string;
  status?: ReadonlyArray<Child> | undefined;
  isDocked?: boolean | undefined;
  className?: string | undefined;
  children: ReadonlyArray<Child>;
}>;

const ROW_CLASS =
  'flex w-max shrink-0 items-center gap-related p-(--outer-inset) [&_[data-slot=button]]:rounded-inner animate-in fade-in-0 zoom-in-96 slide-in-from-bottom-1.5 duration-300 ease-enter delay-60 fill-mode-backwards motion-reduce:zoom-in-100 motion-reduce:slide-in-from-bottom-0';

const actionsRow = <Message>(
  className: string | undefined,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<Message>,
): Html => h.div([h.DataAttribute('slot', 'action-bar-content'), h.Class(cn(ROW_CLASS, className))], children);

const statusRow = <Message>(status: ReadonlyArray<Child>, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.DataAttribute('slot', 'action-bar-content'), h.AriaHidden(true), h.Class(ROW_CLASS)],
    [
      h.span(
        [
          h.Class(
            'flex h-control items-center gap-control-gap px-(--action-bar-status-pad-x) font-medium whitespace-nowrap [&_svg]:size-icon [&_svg]:shrink-0',
          ),
        ],
        status,
      ),
    ],
  );

export const view = <Message>(config: ViewConfig, h: HtmlBuilder<Message>): Html => {
  const { isOpen, ariaLabel, status, isDocked = false, className, children } = config;
  const maybeStatus = Option.fromNullishOr(status);
  const row = Option.match(maybeStatus, {
    onNone: () => actionsRow(className, children, h),
    onSome: (statusContent) => statusRow(statusContent, h),
  });

  return h.div(
    [
      h.Role('toolbar'),
      h.AriaLabel(ariaLabel),
      h.DataAttribute('slot', 'action-bar'),
      ...(isDocked ? [] : [h.DataAttribute('surface', 'inverse')]),
      ...(isOpen ? [] : [h.DataAttribute('closed', ''), h.Inert(true), h.AriaHidden(true)]),
      h.Class(
        cn(
          'relative flex items-center justify-center text-control',
          '[--outer-inset:calc((var(--spacing-control-lg)+2*var(--spacing-popup-inset)-var(--spacing-control))/2)]',
          !isDocked && [
            'sticky bottom-4 origin-bottom self-center overflow-hidden bar-corners bg-popover text-popover-foreground shadow-popup',
            'transition-[opacity,translate,scale] duration-300 ease-spring data-closed:pointer-events-none data-closed:translate-y-2 data-closed:scale-95 data-closed:opacity-0 motion-reduce:data-closed:translate-y-0 motion-reduce:data-closed:scale-100',
          ],
        ),
      ),
    ],
    [
      h.div([h.Class(isDocked ? 'contents' : 'flex w-max')], [row]),
      h.span(
        [h.Role('status'), h.Class('sr-only')],
        Option.getOrElse(maybeStatus, () => []),
      ),
    ],
  );
};

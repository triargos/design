import { Array, Option, String } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import * as Kbd from './kbd.ts';
import type { Child } from './part.ts';
import * as Tooltip from './tooltip.ts';

const MAC_KEYS: Readonly<Record<string, string>> = {
  $mod: '⌘',
  cmd: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  control: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  backspace: '⌫',
  delete: '⌦',
  escape: 'Esc',
  esc: 'Esc',
  tab: '⇥',
};

const OTHER_KEYS: Readonly<Record<string, string>> = {
  $mod: 'Ctrl',
  cmd: 'Win',
  meta: 'Win',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  return: 'Enter',
  backspace: 'Backspace',
  delete: 'Del',
  escape: 'Esc',
  esc: 'Esc',
  tab: 'Tab',
};

const ARROWS: Readonly<Record<string, string>> = {
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

const DEFAULT_THEN_LABEL = 'then';

const MAC_PLATFORM_PATTERN = /Mac|iPhone|iPad|iPod/;

export const isMacPlatform = (platform: string): boolean => MAC_PLATFORM_PATTERN.test(platform);

const formatKey = (part: string, isMac: boolean): string => {
  const name = String.toLowerCase(part);
  const keys = isMac ? MAC_KEYS : OTHER_KEYS;
  return Option.getOrElse(
    Option.orElse(Option.fromNullishOr(keys[name]), () => Option.fromNullishOr(ARROWS[name])),
    () => (part.length === 1 ? String.toUpperCase(part) : part),
  );
};

const formatShortcut = (shortcut: string, isMac: boolean): string =>
  Array.join(
    Array.map(String.split(shortcut, '+'), (part) => formatKey(part, isMac)),
    isMac ? '' : '+',
  );

export type ViewConfig<ParentMessage> = Omit<Tooltip.ViewConfig<ParentMessage>, 'content'> &
  Readonly<{
    label: Child;
    shortcut: ReadonlyArray<string>;
    isMac: boolean;
    thenLabel?: string;
  }>;

const keys = <ParentMessage>(
  shortcut: ReadonlyArray<string>,
  isMac: boolean,
  thenLabel: string,
  h: HtmlBuilder<ParentMessage>,
): ReadonlyArray<Html> =>
  Array.flatMap(shortcut, (step, index) => [
    ...(index > 0 ? [h.span([h.Class('text-muted-foreground')], [thenLabel])] : []),
    Kbd.view(
      {
        className: 'h-(--text-caption--line-height) min-w-(--text-caption--line-height)',
        children: [formatShortcut(step, isMac)],
      },
      h,
    ),
  ]);

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { label, shortcut, isMac, thenLabel = DEFAULT_THEN_LABEL, className, ...tooltipConfig } = config;
  return Tooltip.view(
    {
      ...tooltipConfig,
      className: cn('flex items-center gap-control-gap px-[calc(var(--tooltip-pad-x)+2px)]', className),
      content: [
        label,
        Kbd.group({ attributes: [h.AriaHidden(true)], children: keys(shortcut, isMac, thenLabel, h) }, h),
      ],
    },
    h,
  );
};

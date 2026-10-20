import { useSyncExternalStore } from 'react';

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

/**
 * One key combination as it is printed on the keyboard: `'$mod+Shift+P'` is `⌘⇧P` on a Mac, `Ctrl+Shift+P` elsewhere.
 * `$mod` is ⌘ on a Mac and Ctrl elsewhere (the tinykeys convention); single letters are upper case.
 */
function formatShortcut(shortcut: string, { mac }: { readonly mac: boolean }): string {
  const keys = mac ? MAC_KEYS : OTHER_KEYS;
  return shortcut
    .split('+')
    .map((part) => {
      const name = part.toLowerCase();
      return keys[name] ?? ARROWS[name] ?? (part.length === 1 ? part.toUpperCase() : part);
    })
    .join(mac ? '' : '+');
}

const subscribe = () => () => {};
const isMacClient = () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
// The prerender cannot know the platform: it prints Ctrl, and a Mac switches to ⌘ right after hydration.
const isMacServer = () => false;

/** Whether the keyboard has ⌘. `false` on the server and while hydrating, so the markup matches. */
function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, isMacClient, isMacServer);
}

export { formatShortcut, useIsMac };

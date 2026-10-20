/** `'$mod+Shift+K'` → `⌘⇧K` on a Mac, `Ctrl+⇧+K` elsewhere. `$mod` is ⌘ on a Mac and Ctrl elsewhere. */
export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  const keys: Record<string, string> = {
    $mod: isMac ? '⌘' : 'Ctrl',
    cmd: '⌘',
    alt: isMac ? '⌥' : 'Alt',
    option: isMac ? '⌥' : 'Alt',
    shift: '⇧',
    ctrl: 'Ctrl',
    control: 'Ctrl',
    backspace: '⌫',
    enter: '↵',
    return: '↵',
    escape: 'Esc',
    esc: 'Esc',
  };
  return shortcut
    .split('+')
    .map((part) => keys[part.toLowerCase()] ?? (part.length === 1 ? part.toUpperCase() : part))
    .join(isMac ? '' : '+');
}

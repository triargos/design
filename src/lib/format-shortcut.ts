export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  return shortcut
    .split('+')
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === '$mod') return isMac ? '⌘' : 'Ctrl';
      if (lower === 'cmd') return '⌘';
      if (lower === 'alt' || lower === 'option') return isMac ? '⌥' : 'Alt';
      if (lower === 'shift') return '⇧';
      if (lower === 'ctrl' || lower === 'control') return 'Ctrl';
      if (lower === 'backspace') return '⌫';
      if (lower === 'enter' || lower === 'return') return '↵';
      if (lower === 'escape' || lower === 'esc') return 'Esc';
      return part.length === 1 ? part.toUpperCase() : part;
    })
    .join(isMac ? '' : '+');
}

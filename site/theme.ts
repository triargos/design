import { useEffect, useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const KEY = 'theme';
const CHANGE = 'themechange';

const subscribe = (onChange: () => void) => {
  const dark = window.matchMedia('(prefers-color-scheme: dark)');
  dark.addEventListener('change', onChange);
  window.addEventListener(CHANGE, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    dark.removeEventListener('change', onChange);
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener('storage', onChange);
  };
};

const readPreference = (): ThemePreference => {
  const stored = window.localStorage.getItem(KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
};

const readMode = (): 'light' | 'dark' => {
  const preference = readPreference();
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const setPreference = (next: ThemePreference) => {
  if (next === 'system') window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, next);
  window.dispatchEvent(new Event(CHANGE));
};

/**
 * The theme picker's value, kept in `localStorage`. `<html>` carries `.dark` and `color-scheme`: the inline script in
 * `index.html` sets them before the first paint, this keeps them in sync. Prerendered as `system`.
 */
export function useTheme() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => 'system' as const);
  const mode = useSyncExternalStore(subscribe, readMode, () => 'light' as const);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains('dark') === (mode === 'dark')) return;
    // Every color transition would fire at once and smear the switch: off for the swap, back on the next frame.
    const freeze = document.createElement('style');
    freeze.textContent = '*,*::before,*::after{transition:none!important}';
    document.head.append(freeze);
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
    void window.getComputedStyle(root).opacity;
    requestAnimationFrame(() => freeze.remove());
  }, [mode]);

  return [preference, setPreference] as const;
}

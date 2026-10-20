import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The named scales in `tailwind.css`. Unregistered, `twMerge` reads `text-body` as a color and drops the text color
// next to it, does not see that `gap-4` overrides `gap-group`, and keeps both `shadow-raised` and `shadow-none`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['title', 'heading', 'body', 'control', 'caption', 'overline'],
      spacing: ['tight', 'related', 'group', 'page', 'section'],
      radius: ['control-xs', 'control-sm', 'control', 'control-lg', 'popup', 'card', 'dialog', 'panel', 'inner'],
      shadow: ['border', 'field', 'field-flat', 'raised', 'raised-hover', 'popup', 'modal'],
      ease: ['enter', 'move', 'sheet'],
    },
    // `tailwind-merge` has no theme scale for durations.
    classGroups: { duration: [{ duration: ['enter', 'feedback', 'move', 'sheet'] }] },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

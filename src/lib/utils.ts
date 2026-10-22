import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The named scales in `tailwind.css`. Unregistered, `twMerge` reads `text-body` as a color and drops the text color
// next to it, does not see that `gap-4` overrides `gap-group`, and keeps both `shadow-raised` and `shadow-none`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['title', 'heading', 'body', 'control', 'caption'],
      // Spacing roles, then the sizing scale (`tailwind.css`, Sizing).
      spacing: [
        'tight',
        'related',
        'part',
        'group',
        'card',
        'page',
        'section',
        'control-2xs',
        'control-xs',
        'control-sm',
        'control',
        'control-lg',
        'control-pad-xs',
        'control-pad-sm',
        'control-pad',
        'control-gap-sm',
        'control-gap',
        'icon-xs',
        'icon-sm',
        'icon',
        'icon-lg',
        'field-pad',
        'field-pad-y',
        'menu-item',
        'menu-item-pad',
        'row-pad-x',
        'row-pad-y',
        'row-gap',
        'modal',
        'popup',
        'picker',
        'popup-inset',
        'card-inset',
        'list-inset',
        'track',
      ],
      radius: [
        'control-xs',
        'control-sm',
        'control',
        'control-lg',
        'popup',
        'card',
        'dialog',
        'panel',
        'inner',
        'checkbox',
        'tooltip',
        'area',
        'block',
        'track',
      ],
      shadow: ['border', 'field', 'field-edge', 'field-flat', 'card', 'raised', 'raised-hover', 'popup', 'modal'],
      ease: ['enter', 'move'],
    },
    // `tailwind-merge` has no theme scale for durations.
    classGroups: { duration: [{ duration: ['enter', 'feedback', 'move', 'modal'] }] },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The type roles, spacing steps, radius roles, shadows and motion roles in `tailwind.css`. Unregistered, `twMerge` reads `text-body`
// as a color and drops `text-muted-foreground`, does not see that `gap-4` overrides `gap-group`, and keeps both
// `shadow-raised` and `shadow-none`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['tight', 'related', 'group', 'page', 'section'],
      radius: ['control-xs', 'control-sm', 'control', 'control-lg', 'popup', 'card', 'dialog', 'panel'],
      shadow: ['border', 'field', 'field-flat', 'raised', 'raised-hover', 'popup', 'modal'],
      ease: ['enter', 'move', 'sheet'],
    },
    classGroups: {
      'font-size': [{ text: ['title', 'heading', 'body', 'control', 'caption', 'overline'] }],
      rounded: ['rounded-inner'],
      duration: [{ duration: ['enter', 'feedback', 'move', 'sheet'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { cn } from '~/lib/utils';

/**
 * A flat track (default 20×36, sm 16×28) with a flat thumb 2px in; no edges, no shadows. Off: a 14% `foreground`
 * veil (`neutral-subtle` is too faint for a white thumb on a light page) and a white thumb. On: the brand fill. Hover strengthens the fill; a press stretches the thumb 4px toward the
 * other side (`--switch-stretch`). The thumb travels (`duration-move`); the fill changes as feedback.
 */
function Switch({
  className,
  size = 'default',
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: 'sm' | 'default';
}) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      data-size={size}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 items-center rounded-full bg-foreground/14 p-0.5 outline-none',
        '[--switch-stretch:0px] data-[size=default]:[--switch-thumb:--spacing(4)] data-[size=sm]:[--switch-thumb:--spacing(3)]',
        'data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7',
        'transition-[background-color,box-shadow] duration-feedback',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'not-data-disabled:hover:bg-foreground/20 not-data-disabled:active:[--switch-stretch:--spacing(1)]',
        'data-checked:bg-primary-solid not-data-disabled:data-checked:hover:bg-[color-mix(in_oklch,var(--primary-solid),black_8%)]',
        'focus-visible:ring-3 focus-visible:inset-ring focus-visible:ring-ring/24 focus-visible:inset-ring-ring',
        'group-has-[:focus-visible]/field-label:ring-0',
        'aria-invalid:inset-ring aria-invalid:inset-ring-destructive-border focus-visible:aria-invalid:ring-destructive/16',
        'data-disabled:cursor-not-allowed data-disabled:bg-disabled',
        className,
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={cn(
          'pointer-events-none block h-(--switch-thumb) w-[calc(var(--switch-thumb)+var(--switch-stretch))] rounded-full bg-thumb',
          'transition-[width,translate,background-color] duration-move ease-move motion-reduce:transition-none',
          'data-checked:translate-x-[calc(var(--switch-thumb)-var(--switch-stretch))] data-checked:bg-primary-solid-foreground',
          'group-data-disabled/switch:bg-disabled-foreground group-data-disabled/switch:data-checked:bg-disabled-foreground',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

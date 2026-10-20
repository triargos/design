import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';

import { type ButtonProps, buttonVariants } from '~/components/ui/button';

import { cn } from '~/lib/utils';

/**
 * A button that stays pressed: a filter, a mark, a flag. `pressed` + `onPressedChange` (or `defaultPressed`). A neutral
 * ghost, so at rest it takes its container's text color; pressed, a quiet fill one step deeper than hover. Sizes as
 * `Button`. An action is a `Button`; a setting that applies at once is a `Switch`.
 */
function Toggle({ className, size = 'default', ...props }: TogglePrimitive.Props & { size?: ButtonProps['size'] }) {
  return (
    <TogglePrimitive
      data-slot='toggle'
      data-size={size}
      className={(state) =>
        buttonVariants({
          emphasis: 'ghost',
          size,
          className: cn(
            'data-pressed:bg-[color-mix(in_oklch,var(--intent-subtle),var(--intent)_8%)] data-pressed:hover:bg-[color-mix(in_oklch,var(--intent-subtle),var(--intent)_8%)]',
            typeof className === 'function' ? className(state) : className,
          ),
        })
      }
      {...props}
    />
  );
}

export { Toggle };

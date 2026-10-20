import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { inputSurfaceVariants } from '~/components/ui/input';
import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

/** An entry of `OptionSelect` and `SearchSelect`, and the shape `Select`'s `items` takes to show labels. */
export interface SelectOption {
  readonly value: string;
  readonly label: string;
  /** `SearchSelect` shows it muted beside the label. */
  readonly description?: string;
}

/** The select field: `SelectTrigger` and a select-like `ComboboxTrigger`. */
export const selectTriggerVariants = cva(
  [
    inputSurfaceVariants({ scope: 'self' }),
    "flex w-full items-center justify-between gap-2 px-3.5 py-1 text-control whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
  ],
  {
    variants: {
      size: {
        default: 'h-10',
        sm: 'h-9',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

type SelectProps<Value> = Omit<SelectPrimitive.Root.Props<Value>, 'onValueChange'> & {
  onValueChange?: (value: Value, eventDetails: SelectPrimitive.Root.ChangeEventDetails) => void;
};

/** Single-value select. Base UI reports `null` only for a null-valued item; none of ours has one, so
 *  `onValueChange` takes the value without `null`. */
function Select<Value>({ onValueChange, ...props }: SelectProps<Value>) {
  return (
    <SelectPrimitive.Root<Value>
      onValueChange={(value, eventDetails) => {
        if (value !== null) onValueChange?.(value, eventDetails);
      }}
      {...props}
    />
  );
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot='select-group' className={cn('scroll-my-1', className)} {...props} />;
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot='select-value'
      className={cn('flex min-w-0 flex-1 overflow-hidden text-left', className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size,
  children,
  ...props
}: SelectPrimitive.Trigger.Props & VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectPrimitive.Trigger
      data-slot='select-trigger'
      className={cn(
        selectTriggerVariants({ size }),
        'data-placeholder:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
        className,
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon render={<ChevronDownIcon className='pointer-events-none size-4 text-faint-foreground' />} />
    </SelectPrimitive.Trigger>
  );
}

const scrollArrowClassName =
  "z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4";

/** Below the trigger, at least as wide; scroll arrows at the ends of a list taller than the window. */
function SelectContent({ className, children, ...props }: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4} alignItemWithTrigger={false} className='isolate z-50'>
        <SelectPrimitive.Popup
          data-slot='select-content'
          data-surface='popup'
          className={cn(
            popupSurface,
            'relative isolate z-50 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}>
          <SelectPrimitive.ScrollUpArrow className={cn('top-0', scrollArrowClassName)}>
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List className='p-1'>{children}</SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className={cn('bottom-0', scrollArrowClassName)}>
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot='select-label'
      className={cn('px-2 py-1.5 text-caption text-muted-foreground', className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot='select-item'
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-inner py-2 pr-8 pl-2.5 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}>
      <SelectPrimitive.ItemText className='flex flex-1 shrink-0 items-center gap-2 whitespace-nowrap'>
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={<span className='pointer-events-none absolute right-2.5 flex size-3.5 items-center justify-center' />}>
        <CheckIcon className='size-4' />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot='select-separator'
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };

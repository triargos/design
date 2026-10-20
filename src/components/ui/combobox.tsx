import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import * as React from 'react';
import { useUiStrings } from '~/lib/ui-config';

import { inputSurfaceVariants } from '~/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group';
import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

/** Typing highlights the first match (Base UI defaults `autoHighlight` to off), so Enter picks it. */
function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>({
  autoHighlight = true,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple, Item>) {
  return <ComboboxPrimitive.Root autoHighlight={autoHighlight} {...props} />;
}

function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot='combobox-value' {...props} />;
}

/** Bare trigger: bring the content, e.g. `render={<Button />}` with a `ComboboxValue` and an icon. */
function ComboboxTrigger(props: ComboboxPrimitive.Trigger.Props) {
  return <ComboboxPrimitive.Trigger data-slot='combobox-trigger' {...props} />;
}

function ComboboxClear(props: ComboboxPrimitive.Clear.Props) {
  const strings = useUiStrings();
  return (
    <ComboboxPrimitive.Clear
      data-slot='combobox-clear'
      aria-label={strings.selectClear}
      render={<InputGroupButton variant='ghost' size='icon-xs' />}
      {...props}>
      <XIcon className='pointer-events-none' />
    </ComboboxPrimitive.Clear>
  );
}

/**
 * The field: Base UI's `InputGroup` on our `InputGroup` surface, so the popup anchors to the whole field, not the
 * native input. `startAddon` (a search icon); a ⇅ trigger that gives way to the clear button once there is a value
 * (Base UI unmounts `Clear` while empty).
 */
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  startAddon,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
  startAddon?: React.ReactNode;
}) {
  const strings = useUiStrings();
  return (
    <ComboboxPrimitive.InputGroup render={<InputGroup className={cn('w-auto', className)} />}>
      {startAddon && (
        <InputGroupAddon align='inline-start' className='[&>svg:not([class*=text-])]:text-faint-foreground'>
          {startAddon}
        </InputGroupAddon>
      )}
      <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
      <InputGroupAddon align='inline-end'>
        {showTrigger && (
          <InputGroupButton
            size='icon-xs'
            variant='ghost'
            render={<ComboboxTrigger />}
            aria-label={strings.selectOpen}
            // ComboboxTrigger renders a native <button>; Button's render-prop heuristic would set nativeButton=false
            // and trip Base UI's mismatch warning.
            nativeButton
            data-slot='input-group-button'
            className='group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent'
            disabled={disabled}>
            <ChevronsUpDownIcon className='pointer-events-none' />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </ComboboxPrimitive.InputGroup>
  );
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, 'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'>) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className='isolate z-50'>
        <ComboboxPrimitive.Popup
          data-slot='combobox-content'
          data-surface='popup'
          className={cn(
            popupSurface,
            // At least as wide as the field, wider for long items, up to the window.
            'group/combobox-content relative flex max-h-[min(var(--available-height),23rem)] max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) flex-col overflow-hidden duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-9 *:data-[slot=input-group]:rounded-inner',
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot='combobox-list'
      className={cn('min-h-0 flex-1 scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0', className)}
      {...props}
    />
  );
}

/**
 * The check leads in its own 16px column, kept empty when unselected, so labels line up; the same place as the
 * indicator of a menu's checkbox item.
 */
export const comboboxItemClassName =
  "grid w-full cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-inner px-2.5 py-2 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item data-slot='combobox-item' className={cn(comboboxItemClassName, className)} {...props}>
      <ComboboxPrimitive.ItemIndicator className='col-start-1 flex'>
        <CheckIcon />
      </ComboboxPrimitive.ItemIndicator>
      {/* Long labels wrap. */}
      <div className='col-start-2 flex min-w-0 items-center gap-2 wrap-anywhere'>{children}</div>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot='combobox-group'
      className={cn('[[role=group]+&]:mt-1.5', className)}
      {...props}
    />
  );
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot='combobox-label'
      className={cn('px-2.5 py-1.5 text-caption font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

function ComboboxCollection(props: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot='combobox-collection' {...props} />;
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot='combobox-empty'
      // Base UI renders the children only while the list is empty.
      className={cn('text-center text-body text-muted-foreground not-empty:px-2.5 not-empty:py-2', className)}
      {...props}
    />
  );
}

function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot='combobox-separator'
      className={cn('-mx-1 my-1 h-px bg-border last:hidden', className)}
      {...props}
    />
  );
}

function ComboboxChips({ className, ...props }: ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot='combobox-chips'
      className={cn(
        inputSurfaceVariants({ scope: 'within' }),
        // 32px chips 4px in (3px padding + the border), so 40px with one row; rows wrap 4px apart.
        'flex min-h-10 flex-wrap items-center gap-1 p-[3px] text-body',
        // Base UI marks the input `disabled` and chips `aria-disabled`; block the whole surface.
        'has-disabled:pointer-events-none has-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChip({ className, children, ...props }: ComboboxPrimitive.Chip.Props) {
  return (
    <ComboboxPrimitive.Chip
      data-slot='combobox-chip'
      className={cn(
        // A flat 4% fill, no lift. 32px, 4px inside the 40px field: `rounded-inner` follows the field's curve.
        'flex h-8 w-fit items-center rounded-inner bg-foreground/4 pl-2.5 text-caption font-medium whitespace-nowrap text-foreground [--outer-inset:--spacing(1)] aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed dark:bg-foreground/8',
        className,
      )}
      {...props}>
      {children}
      <ComboboxPrimitive.ChipRemove
        // The full chip height is the hit area; only the glyph shows, brightening on hover.
        className='flex h-full shrink-0 cursor-pointer items-center px-2 text-faint-foreground outline-none hover:text-foreground focus-visible:text-foreground'
        data-slot='combobox-chip-remove'>
        <XIcon className='pointer-events-none size-3.5' />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot='combobox-chip-input'
      // Text on the field's 14px line when empty (3px padding + 11px); 4px after a chip.
      className={cn(
        'h-8 min-w-16 flex-1 pl-[11px] outline-none placeholder:text-muted-foreground [[data-slot=combobox-chip]+&]:pl-1',
        className,
      )}
      {...props}
    />
  );
}

/** Live region for async lists ("Lädt…", "3 Ergebnisse"); collapses while empty. */
function ComboboxStatus({ className, ...props }: ComboboxPrimitive.Status.Props) {
  return (
    <ComboboxPrimitive.Status
      data-slot='combobox-status'
      className={cn('px-2.5 py-2 text-caption font-medium text-muted-foreground empty:m-0 empty:p-0', className)}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxStatus,
  ComboboxClear,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};

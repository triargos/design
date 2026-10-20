import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CheckIcon, ChevronsUpDownIcon, SearchIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group';
import { popupSurface } from '~/components/ui/popover';
import { selectTriggerVariants } from '~/components/ui/select';

import { cn } from '~/lib/utils';

type Virtualizer = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;

/** What the root shares with its parts: the chips field the popup anchors to, and the state of a virtualized list. */
interface ComboboxContextValue {
  readonly chips: HTMLDivElement | null;
  readonly setChips: (element: HTMLDivElement | null) => void;
  readonly open: boolean;
  readonly virtualizerRef: React.RefObject<Virtualizer | null>;
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

const useComboboxContext = () => {
  const context = React.use(ComboboxContext);
  if (!context) throw new Error('Combobox parts must be used inside <Combobox>.');
  return context;
};

/**
 * Typing highlights the first match (Base UI defaults `autoHighlight` to off), so Enter picks it. With `virtualized`,
 * render the rows through `ComboboxVirtualizedList`: Base UI cannot scroll a row it has not rendered into view, so a
 * keyboard highlight asks the virtualizer to.
 */
function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>({
  autoHighlight = true,
  onOpenChange,
  onItemHighlighted,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple, Item>) {
  const [openState, setOpenState] = React.useState(props.defaultOpen ?? false);
  const [chips, setChips] = React.useState<HTMLDivElement | null>(null);
  const virtualizerRef = React.useRef<Virtualizer | null>(null);
  const open = props.open ?? openState;

  const scrollToHighlight = ({ reason, index }: ComboboxPrimitive.Root.HighlightEventDetails) => {
    const virtualizer = virtualizerRef.current;
    if (!virtualizer) return;
    const isStart = index === 0;
    const isEnd = index === virtualizer.options.count - 1;
    if (reason === 'none' || (reason === 'keyboard' && (isStart || isEnd))) {
      queueMicrotask(() => virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' }));
    }
  };

  return (
    <ComboboxContext value={{ chips, setChips, open, virtualizerRef }}>
      <ComboboxPrimitive.Root
        autoHighlight={autoHighlight}
        onOpenChange={(next, details) => {
          setOpenState(next);
          onOpenChange?.(next, details);
        }}
        onItemHighlighted={(item, details) => {
          if (item !== undefined) scrollToHighlight(details);
          onItemHighlighted?.(item, details);
        }}
        {...props}
      />
    </ComboboxContext>
  );
}

function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot='combobox-value' {...props} />;
}

/** A select-like trigger; pair it with a `ComboboxSearch` in the popup. Children: a `ComboboxValue`. */
function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot='combobox-trigger'
      className={cn(selectTriggerVariants(), className)}
      {...props}>
      {children}
      <ChevronsUpDownIcon />
    </ComboboxPrimitive.Trigger>
  );
}

interface ComboboxInputProps extends ComboboxPrimitive.Input.Props {
  /** The clear button's accessible name. */
  readonly clearLabel?: string;
  /** The ⇅ button's accessible name. */
  readonly openLabel?: string;
}

/**
 * The field: Base UI's `InputGroup` on our `InputGroup` surface, so the popup anchors to the whole field, not the
 * native input. A ⇅ button opens the list; once there is a value, a clear button takes its place (Base UI unmounts
 * `Clear` while empty).
 */
function ComboboxInput({
  className,
  disabled = false,
  clearLabel = 'Clear',
  openLabel = 'Open list',
  ...props
}: ComboboxInputProps) {
  return (
    <ComboboxPrimitive.InputGroup render={<InputGroup className={cn('w-auto', className)} />}>
      <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          size='icon-xs'
          render={<ComboboxPrimitive.Trigger />}
          aria-label={openLabel}
          // Trigger renders a native <button>; Button's render-prop heuristic would set nativeButton=false and trip
          // Base UI's mismatch warning.
          nativeButton
          data-slot='input-group-button'
          className='group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent'
          disabled={disabled}>
          <ChevronsUpDownIcon className='pointer-events-none' />
        </InputGroupButton>
        <ComboboxPrimitive.Clear
          data-slot='combobox-clear'
          aria-label={clearLabel}
          render={<InputGroupButton size='icon-xs' />}
          disabled={disabled}>
          <XIcon className='pointer-events-none' />
        </ComboboxPrimitive.Clear>
      </InputGroupAddon>
    </ComboboxPrimitive.InputGroup>
  );
}

/** The search field inside the popup, under a `ComboboxTrigger`: 36px, 4px in, a search icon ahead of the text. */
function ComboboxSearch({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.InputGroup
      render={<InputGroup className={cn('m-1 mb-0 h-9 w-auto rounded-inner', className)} />}>
      <InputGroupAddon align='inline-start' className='[&>svg:not([class*=text-])]:text-faint-foreground'>
        <SearchIcon />
      </InputGroupAddon>
      <ComboboxPrimitive.Input render={<InputGroupInput />} {...props} />
    </ComboboxPrimitive.InputGroup>
  );
}

/** Anchored to the field, or to `ComboboxChips` when there are chips. */
function ComboboxContent({ className, ...props }: ComboboxPrimitive.Popup.Props) {
  const { chips } = useComboboxContext();
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner sideOffset={4} align='start' anchor={chips ?? undefined} className='isolate z-50'>
        <ComboboxPrimitive.Popup
          data-slot='combobox-content'
          data-surface='popup'
          className={cn(
            popupSurface,
            // At least as wide as the field, wider for long items, up to the window.
            'group/combobox-content relative flex max-h-[min(var(--available-height),23rem)] max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) flex-col overflow-hidden duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
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
const itemClassName =
  "grid w-full cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-inner px-2.5 py-2 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const itemCheck = (
  <ComboboxPrimitive.ItemIndicator className='col-start-1 flex'>
    <CheckIcon />
  </ComboboxPrimitive.ItemIndicator>
);

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item data-slot='combobox-item' className={cn(itemClassName, className)} {...props}>
      {itemCheck}
      {/* Long labels wrap. */}
      <div className='col-start-2 flex min-w-0 items-center gap-2 wrap-anywhere'>{children}</div>
    </ComboboxPrimitive.Item>
  );
}

const ROW_ESTIMATE = 36;
const OVERSCAN = 20;

interface ComboboxVirtualizedListProps<T> {
  readonly children: (item: T) => React.ReactNode;
  /** The leading column for an item in place of the check (e.g. a plus on a create row); `undefined` keeps the check. */
  readonly indicator?: (item: T) => React.ReactNode;
  /** Keys the size cache by item, not index: a row never inherits the size of whatever sat at its index before. */
  readonly itemKey?: (item: T) => React.Key;
}

/** The list of a `Combobox virtualized`: only the rows in view render. `children` renders a row's content. */
function ComboboxVirtualizedList<T>({ children, indicator, itemKey }: ComboboxVirtualizedListProps<T>) {
  const { open, virtualizerRef } = useComboboxContext();
  const filteredItems = ComboboxPrimitive.useFilteredItems<T>();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    enabled: open,
    count: filteredItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE,
    getItemKey: itemKey && ((index) => itemKey(filteredItems[index]!)),
    overscan: OVERSCAN,
    // No paddingStart/End: the listbox's `p-1` is the one inset, on every side, so a row's `rounded-inner` stays
    // concentric with the popup. Scroll padding keeps a keyboard-scrolled row clear of the edge.
    scrollPaddingEnd: 4,
    scrollPaddingStart: 4,
  });

  React.useImperativeHandle(virtualizerRef, () => virtualizer);

  // Stable (the virtualizer instance is), so the list is measured once per mount, not on every render.
  const handleScrollRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      scrollRef.current = element;
      if (element) virtualizer.measure();
    },
    [virtualizer],
  );

  return (
    <ComboboxPrimitive.List data-slot='combobox-list' className='overflow-hidden p-1 data-empty:p-0'>
      {filteredItems.length > 0 && (
        <div
          role='presentation'
          ref={handleScrollRef}
          className='no-scrollbar max-h-72 overflow-x-hidden overflow-y-auto overscroll-contain'>
          <div role='presentation' style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = filteredItems[virtualItem.index]!;
              const lead = indicator?.(item);
              return (
                <ComboboxPrimitive.Item
                  key={virtualItem.key}
                  data-slot='combobox-item'
                  index={virtualItem.index}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  aria-setsize={filteredItems.length}
                  aria-posinset={virtualItem.index + 1}
                  className={itemClassName}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    // No height from the virtualizer: the row keeps its natural height and `measureElement` reads it.
                    // A height from the cache would make a stale size measure itself again and never shrink back.
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  value={item}>
                  {lead === undefined ? itemCheck : <span className='col-start-1 flex'>{lead}</span>}
                  {/* One line: a virtualized row cannot widen the popup. */}
                  <div className='col-start-2 flex min-w-0 items-center gap-2 truncate'>{children(item)}</div>
                </ComboboxPrimitive.Item>
              );
            })}
          </div>
        </div>
      )}
    </ComboboxPrimitive.List>
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

/** The field of a `multiple` combobox: the chips, then `ComboboxChipsInput`. The popup anchors to it. */
function ComboboxChips({ className, ...props }: ComboboxPrimitive.Chips.Props) {
  const { setChips } = useComboboxContext();
  return (
    <ComboboxPrimitive.Chips
      ref={setChips}
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

interface ComboboxChipProps extends ComboboxPrimitive.Chip.Props {
  /** The remove button's accessible name. */
  readonly removeLabel?: string;
}

function ComboboxChip({ className, children, removeLabel = 'Remove', ...props }: ComboboxChipProps) {
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
        aria-label={removeLabel}
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

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSearch,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxVirtualizedList,
};

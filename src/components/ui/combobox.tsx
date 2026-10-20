import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { useVirtualizer } from '@tanstack/react-virtual';
import { IconCheck, IconPlus, IconSelector, IconX } from '@tabler/icons-react';
import * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group';
import type { SelectOption } from '~/components/ui/select';

import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

type Virtualizer = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;

/**
 * A typed value of a `Combobox allowCustom`: not an item, its text is the value and the label. A `SelectOption`, so
 * `ComboboxValue` renders its chip like any other.
 */
class CustomEntry implements SelectOption {
  readonly label: string;
  constructor(readonly value: string) {
    this.label = value;
  }
}

type Entry = SelectOption | CustomEntry;

const entryLabel = (entry: Entry) => entry.label;
const entryValue = (entry: Entry) => entry.value;
const entryKey = (entry: Entry) => (entry instanceof CustomEntry ? `custom:${entry.value}` : entry.value);
const isSameEntry = (a: Entry, b: Entry) =>
  a instanceof CustomEntry === b instanceof CustomEntry && a.value === b.value;

/** What the root shares with its parts. */
interface ComboboxContextValue {
  /** The chips field the popup anchors to. */
  readonly chips: HTMLDivElement | null;
  readonly setChips: (element: HTMLDivElement | null) => void;
  readonly open: boolean;
  readonly virtualized: boolean;
  readonly virtualizerRef: React.RefObject<Virtualizer | null>;
  readonly custom: {
    /** A single value that is typed text, not an item's. */
    readonly active: boolean;
    /** The selected values that are typed text. */
    readonly selected: ReadonlySet<string>;
    readonly label: string;
    readonly optionLabel: (text: React.ReactNode) => React.ReactNode;
    readonly noteId: string;
  } | null;
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

const useComboboxContext = () => {
  const context = React.use(ComboboxContext);
  if (!context) throw new Error('Combobox parts must be used inside <Combobox>.');
  return context;
};

interface ComboboxBaseProps extends Pick<
  ComboboxPrimitive.Root.Props<SelectOption>,
  'disabled' | 'readOnly' | 'open' | 'onOpenChange' | 'name' | 'required' | 'children'
> {
  readonly items: ReadonlyArray<SelectOption>;
  /** Only the rows in view render: for lists of hundreds of items and up. Rows keep to one line. */
  readonly virtualized?: boolean;
}

interface ComboboxCustomProps {
  /**
   * A value is an item's value or the typed text. While the query matches no item's label, the list ends in a row that
   * takes it; Enter picks it once nothing else matches.
   */
  readonly allowCustom?: boolean;
  /** Marks a typed value: in its row, and (single) as the field's description. */
  readonly customLabel?: string;
  /** The row that takes the query; `text` is the typed text, cut to fit. */
  readonly customOptionLabel?: (text: React.ReactNode) => React.ReactNode;
}

type ComboboxProps = ComboboxBaseProps &
  ComboboxCustomProps &
  (
    | {
        readonly multiple?: false;
        readonly value: string | null;
        readonly onValueChange: (value: string | null) => void;
      }
    | {
        /** Many values, as chips: compose `ComboboxChips` instead of `ComboboxInput`. */
        readonly multiple: true;
        readonly value: ReadonlyArray<string>;
        readonly onValueChange: (values: string[]) => void;
      }
  );

/** The selected entry leads the list, so a reopened combobox shows it first; the rest keep their order. */
function selectedFirst(entries: ReadonlyArray<Entry>, selected: Entry | null): ReadonlyArray<Entry> {
  if (selected === null || !entries.includes(selected)) return entries;
  return [selected, ...entries.filter((entry) => entry !== selected)];
}

/**
 * A field that filters a list as you type. Values are the items' `value` strings. Typing highlights the first match
 * (Base UI defaults `autoHighlight` to off), so Enter picks it. For a short list without typing, `Select`.
 */
function Combobox(props: ComboboxProps) {
  const { items, virtualized = false, onOpenChange, children, ...root } = props;
  const [openState, setOpenState] = React.useState(false);
  const [chips, setChips] = React.useState<HTMLDivElement | null>(null);
  const [query, setQuery] = React.useState('');
  const virtualizerRef = React.useRef<Virtualizer | null>(null);
  const noteId = React.useId();
  const copy = useLocale().labels;
  const customLabel = props.customLabel ?? copy.custom;

  const optionsByValue = React.useMemo(() => new Map(items.map((option) => [option.value, option])), [items]);
  const labels = React.useMemo(() => new Set(items.map((option) => option.label.toLowerCase())), [items]);

  const allowCustom = props.allowCustom === true;
  const single = props.multiple ? null : props.value;
  const value = props.value;
  const values = React.useMemo(
    (): ReadonlyArray<string> => (value === null ? [] : typeof value === 'string' ? [value] : value),
    [value],
  );
  const customTexts = allowCustom ? values.filter((text) => text !== '' && !optionsByValue.has(text)) : [];
  // Base UI resets the input to the selected label when the value changes identity or drops out of `items`; either
  // would undo every keystroke. So: one `CustomEntry` per custom text, kept while the texts stay the same (not on a new
  // `items`), and they stay in `items`.
  const customKey = JSON.stringify(customTexts);
  const customEntries = React.useMemo(
    () => (JSON.parse(customKey) as string[]).map((text) => new CustomEntry(text)),
    [customKey],
  );
  const customByValue = React.useMemo(
    () => new Map(customEntries.map((entry) => [entry.value, entry])),
    [customEntries],
  );
  const customActive = !props.multiple && customEntries.length > 0;
  const selected: Entry | null =
    single === null ? null : (optionsByValue.get(single) ?? customByValue.get(single) ?? null);

  // Items, then the selected custom values, then (custom) the row that takes the query. Single: the selected entry
  // first.
  const entries = React.useMemo((): ReadonlyArray<Entry> => {
    const typed = query.trim();
    const taken = typed === '' || labels.has(typed.toLowerCase()) || values.includes(typed);
    const typedRow = allowCustom && !taken ? [new CustomEntry(typed)] : [];
    const all: ReadonlyArray<Entry> = [...items, ...customEntries];
    return [...(props.multiple ? all : selectedFirst(all, selected)), ...typedRow];
  }, [props.multiple, items, allowCustom, query, values, labels, customEntries, selected]);

  const scrollToHighlight = ({ reason, index }: ComboboxPrimitive.Root.HighlightEventDetails) => {
    const virtualizer = virtualizerRef.current;
    if (!virtualizer) return;
    const isStart = index === 0;
    const isEnd = index === virtualizer.options.count - 1;
    if (reason === 'none' || (reason === 'keyboard' && (isStart || isEnd))) {
      queueMicrotask(() => virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' }));
    }
  };

  const shared = {
    items: entries,
    virtualized,
    autoHighlight: true,
    itemToStringLabel: entryLabel,
    itemToStringValue: entryValue,
    isItemEqualToValue: isSameEntry,
    disabled: root.disabled,
    readOnly: root.readOnly,
    name: root.name,
    required: root.required,
    open: root.open,
    onOpenChange: (next: boolean, details: ComboboxPrimitive.Root.ChangeEventDetails) => {
      setOpenState(next);
      onOpenChange?.(next, details);
    },
    onInputValueChange: setQuery,
    // Base UI cannot scroll a row it has not rendered into view, so a keyboard highlight asks the virtualizer to.
    onItemHighlighted: (item: Entry | undefined, details: ComboboxPrimitive.Root.HighlightEventDetails) => {
      if (item !== undefined) scrollToHighlight(details);
    },
  };

  return (
    <ComboboxContext
      value={{
        chips,
        setChips,
        open: root.open ?? openState,
        virtualized,
        virtualizerRef,
        custom: allowCustom
          ? {
              active: customActive,
              selected: new Set(customByValue.keys()),
              label: customLabel,
              optionLabel: props.customOptionLabel ?? copy.useCustom,
              noteId,
            }
          : null,
      }}>
      {props.multiple ? (
        <ComboboxPrimitive.Root<Entry, true>
          {...shared}
          multiple
          value={props.value.flatMap((key) => optionsByValue.get(key) ?? customByValue.get(key) ?? [])}
          onValueChange={(next) => props.onValueChange(next.map(entryValue))}>
          {children}
        </ComboboxPrimitive.Root>
      ) : (
        <ComboboxPrimitive.Root<Entry>
          {...shared}
          value={selected}
          onValueChange={(next) => props.onValueChange(next === null ? null : entryValue(next))}>
          {children}
          {/* No visible mark for a typed value: the input reads the note, its list row shows the same label. */}
          {customActive && (
            <span id={noteId} className='sr-only'>
              {customLabel}
            </span>
          )}
        </ComboboxPrimitive.Root>
      )}
    </ComboboxContext>
  );
}

function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot='combobox-value' {...props} />;
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
 * `Clear` while empty). `className` goes to the field.
 */
function ComboboxInput({
  className,
  disabled = false,
  clearLabel: clearLabelProp,
  openLabel: openLabelProp,
  ...props
}: ComboboxInputProps) {
  const { labels } = useLocale();
  const clearLabel = clearLabelProp ?? labels.clear;
  const openLabel = openLabelProp ?? labels.openList;
  const { custom } = useComboboxContext();
  return (
    <ComboboxPrimitive.InputGroup render={<InputGroup className={cn('w-auto', className)} />}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        aria-describedby={custom?.active ? custom.noteId : undefined}
        {...props}
      />
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
          <IconSelector className='pointer-events-none' />
        </InputGroupButton>
        <ComboboxPrimitive.Clear
          data-slot='combobox-clear'
          aria-label={clearLabel}
          render={<InputGroupButton size='icon-xs' />}
          disabled={disabled}>
          <IconX className='pointer-events-none' />
        </ComboboxPrimitive.Clear>
      </InputGroupAddon>
    </ComboboxPrimitive.InputGroup>
  );
}

/** Anchored to the field, or to `ComboboxChips` when there are chips. */
function ComboboxContent({
  className,
  container,
  ...props
}: ComboboxPrimitive.Popup.Props & Pick<ComboboxPrimitive.Portal.Props, 'container'>) {
  const { chips } = useComboboxContext();
  return (
    <ComboboxPrimitive.Portal container={container}>
      <ComboboxPrimitive.Positioner sideOffset={4} align='start' anchor={chips ?? undefined} className='isolate z-50'>
        <ComboboxPrimitive.Popup
          data-slot='combobox-content'
          data-surface='popup'
          className={cn(
            // At least as wide as the field, wider for long items, up to the window.
            'group/combobox-content relative flex max-h-[min(var(--available-height),23rem)] max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) flex-col overflow-hidden rounded-popup bg-popover text-popover-foreground shadow-popup [--outer-inset:--spacing(1)] [--outer-radius:var(--radius-popup)]',
            'duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            // Reduced motion: fade only, no zoom and no slide.
            'motion-reduce:data-closed:zoom-out-100 motion-reduce:data-open:zoom-in-100 motion-reduce:data-open:slide-in-from-top-0 motion-reduce:data-open:slide-in-from-left-0',
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

/** Where a row sits in a virtualized list; `ComboboxItem` reads it. */
interface VirtualRow {
  readonly index: number;
  readonly start: number;
  readonly count: number;
  readonly measure: (element: Element | null) => void;
}

const VirtualRowContext = React.createContext<VirtualRow | null>(null);

const ROW_ESTIMATE = 36;
const OVERSCAN = 20;

interface ComboboxListProps {
  /** A row: a `ComboboxItem` with `value={option}`. A custom value's rows render themselves. */
  readonly children: (option: SelectOption) => React.ReactNode;
  readonly className?: string;
}

/** The rows. With `Combobox virtualized` only those in view render, measured as they mount. */
function ComboboxList({ children, className }: ComboboxListProps) {
  const { virtualized } = useComboboxContext();
  const row = (entry: Entry) => (entry instanceof CustomEntry ? <CustomRow entry={entry} /> : children(entry));
  if (virtualized) return <VirtualizedRows row={row} className={className} />;
  return (
    <ComboboxPrimitive.List
      data-slot='combobox-list'
      className={cn('min-h-0 flex-1 scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0', className)}>
      {(entry: Entry) => <React.Fragment key={entryKey(entry)}>{row(entry)}</React.Fragment>}
    </ComboboxPrimitive.List>
  );
}

function VirtualizedRows({ row, className }: { row: (entry: Entry) => React.ReactNode; className?: string }) {
  const { open, virtualizerRef } = useComboboxContext();
  const filtered = ComboboxPrimitive.useFilteredItems<Entry>();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    enabled: open,
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE,
    // Keys the size cache by item, not index: a row never inherits the size of whatever sat at its index before.
    getItemKey: (index) => entryKey(filtered[index]!),
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
    <ComboboxPrimitive.List data-slot='combobox-list' className={cn('overflow-hidden p-1 data-empty:p-0', className)}>
      {filtered.length > 0 && (
        <div
          role='presentation'
          ref={handleScrollRef}
          className='no-scrollbar max-h-72 overflow-x-hidden overflow-y-auto overscroll-contain'>
          <div role='presentation' style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
            {virtualizer.getVirtualItems().map((item) => (
              <VirtualRowContext
                key={item.key}
                value={{
                  index: item.index,
                  start: item.start,
                  count: filtered.length,
                  measure: virtualizer.measureElement,
                }}>
                {row(filtered[item.index]!)}
              </VirtualRowContext>
            ))}
          </div>
        </div>
      )}
    </ComboboxPrimitive.List>
  );
}

interface ComboboxItemProps extends ComboboxPrimitive.Item.Props {
  /** The leading column in place of the check, e.g. an icon. */
  readonly indicator?: React.ReactNode;
}

/**
 * A row. The check leads in its own 16px column, kept empty when unselected, so labels line up; the same place as the
 * indicator of a menu's checkbox item. Long labels wrap, except in a virtualized list, where a row keeps to one line.
 */
function ComboboxItem({ className, children, indicator, style, ...props }: ComboboxItemProps) {
  const virtual = React.use(VirtualRowContext);
  return (
    <ComboboxPrimitive.Item
      data-slot='combobox-item'
      className={cn(
        "grid w-full cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-inner px-2.5 py-2 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...(virtual && {
        index: virtual.index,
        'data-index': virtual.index,
        ref: virtual.measure,
        'aria-setsize': virtual.count,
        'aria-posinset': virtual.index + 1,
      })}
      style={
        virtual
          ? {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              // No height from the virtualizer: the row keeps its natural height and `measureElement` reads it. A
              // height from the cache would make a stale size measure itself again and never shrink back.
              transform: `translateY(${virtual.start}px)`,
              ...style,
            }
          : style
      }
      {...props}>
      {indicator === undefined ? (
        <ComboboxPrimitive.ItemIndicator className='col-start-1 flex'>
          <IconCheck />
        </ComboboxPrimitive.ItemIndicator>
      ) : (
        <span className='col-start-1 flex'>{indicator}</span>
      )}
      <div className={cn('col-start-2 flex min-w-0 items-center gap-2', virtual ? 'truncate' : 'wrap-anywhere')}>
        {children}
      </div>
    </ComboboxPrimitive.Item>
  );
}

/** A custom value's row: the picked text marked with `customLabel`, or the row that takes the query. */
function CustomRow({ entry }: { entry: CustomEntry }) {
  const { custom } = useComboboxContext();
  if (!custom) return null;
  if (custom.selected.has(entry.value)) {
    return (
      <ComboboxItem value={entry}>
        <span className='truncate'>{entry.value}</span>
        {/* At the row's end: the value truncates first, the hint keeps its width. */}
        <span className='ms-auto shrink-0 text-caption text-muted-foreground in-data-highlighted:text-foreground'>
          {custom.label}
        </span>
      </ComboboxItem>
    );
  }
  // One line, as tall as the other rows: the typed text truncates, the words and quotes around it keep their width.
  return (
    <ComboboxItem value={entry} indicator={<IconPlus className='text-muted-foreground' />}>
      <span className='flex min-w-0 whitespace-pre'>
        {custom.optionLabel(<span className='truncate'>{entry.value}</span>)}
      </span>
    </ComboboxItem>
  );
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
        // 24px chips 6px in (5px padding + the border), so 36px with one row; rows wrap 4px apart.
        'flex min-h-9 flex-wrap items-center gap-1 p-[5px] text-body',
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

function ComboboxChip({ className, children, removeLabel: removeLabelProp, ...props }: ComboboxChipProps) {
  const removeLabel = removeLabelProp ?? useLocale().labels.remove;
  return (
    <ComboboxPrimitive.Chip
      data-slot='combobox-chip'
      className={cn(
        // A flat 4% fill, no lift. 24px, 6px inside the 36px field: `rounded-inner` follows the field's curve.
        'flex h-6 w-fit items-center rounded-inner bg-foreground/4 pl-2 text-caption font-medium whitespace-nowrap text-foreground [--outer-inset:--spacing(1.5)] aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed dark:bg-foreground/8',
        className,
      )}
      {...props}>
      {children}
      <ComboboxPrimitive.ChipRemove
        aria-label={removeLabel}
        // The full chip height is the hit area; only the glyph shows, brightening on hover.
        className='flex h-full shrink-0 cursor-pointer items-center px-2 text-faint-foreground outline-none hover:text-foreground focus-visible:text-foreground'
        data-slot='combobox-chip-remove'>
        <IconX className='pointer-events-none size-3.5' />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot='combobox-chip-input'
      // Text on the field's 12px line when empty (5px padding + 6px); 4px after a chip.
      className={cn(
        'h-6 min-w-16 flex-1 pl-1.5 outline-none max-sm:text-[1rem] placeholder:text-faint-foreground [[data-slot=combobox-chip]+&]:pl-1',
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
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
};

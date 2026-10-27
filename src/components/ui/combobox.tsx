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

// A list entry is one of three: an item (the caller's `SelectOption`), a custom value, or the proposal. The last two
// carry `KIND`; a registered symbol, so the mark survives a spread and a second copy of this file.
const KIND: unique symbol = Symbol.for('@triargos/design/combobox-entry');

/** A value of a `Combobox allowCustom` that names no item: its text is the value and the label. */
interface CustomValue extends SelectOption {
  readonly [KIND]: 'custom';
}

/** The row that takes the query as a new value: “Use “…””. Picked, its text becomes a `CustomValue`. */
interface CustomProposal extends SelectOption {
  readonly [KIND]: 'proposal';
}

type Entry = SelectOption | CustomValue | CustomProposal;

const customValue = (text: string): CustomValue => ({ [KIND]: 'custom', value: text, label: text });
const customProposal = (text: string): CustomProposal => ({ [KIND]: 'proposal', value: text, label: text });

/** A selected value that is typed text, not an item's: mark its chip with it. */
const isCustomValue = (item: SelectOption): item is CustomValue => KIND in item && item[KIND] === 'custom';
const isCustomProposal = (item: SelectOption): item is CustomProposal => KIND in item && item[KIND] === 'proposal';
const kindOf = (entry: Entry) => (KIND in entry ? entry[KIND] : 'item');

const entryLabel = (entry: Entry) => entry.label;
const entryValue = (entry: Entry) => entry.value;
const entryKey = (entry: Entry) => (KIND in entry ? `${entry[KIND]}:${entry.value}` : entry.value);
const isSameEntry = (a: Entry, b: Entry) => kindOf(a) === kindOf(b) && a.value === b.value;

/** A value is custom when it names no item. */
const isCustomText = ({ text, itemsByValue }: { text: string; itemsByValue: ReadonlyMap<string, SelectOption> }) =>
  text !== '' && !itemsByValue.has(text);

/** Base UI's matching: an `Intl.Collator` that ignores case, accents and punctuation. */
type TextFilter = ReturnType<typeof ComboboxPrimitive.useFilter>;

const asText = (text: string) => text;

const isSameText = ({ a, b, filter }: { a: string; b: string; filter: TextFilter }) =>
  filter.startsWith(a, b, asText) && filter.startsWith(b, a, asText);

/** Where in a label the query matches, best first. */
const MATCH = { exact: 0, prefix: 1, wordStart: 2, contains: 3, none: 4 } as const;

/**
 * From this share of a label typed (`coverage`), a prefix or word-start match is what you are typing: it leads even
 * when selected, and the proposal follows it. “onboard” covers 70% of “Onboarding”; “on” 20%.
 */
const STRONG_COVERAGE = 0.5;

/** A word starts after one of these. */
const WORD_SEPARATOR = /[\s\-_/(.]/;

function matchOf({ label, query, filter }: { label: string; query: string; filter: TextFilter }): number {
  if (filter.startsWith(label, query, asText)) {
    return isSameText({ a: label, b: query, filter }) ? MATCH.exact : MATCH.prefix;
  }
  for (let index = 1; index < label.length; index += 1) {
    if (WORD_SEPARATOR.test(label[index - 1]!) && filter.startsWith(label.slice(index), query, asText)) {
      return MATCH.wordStart;
    }
  }
  return filter.contains(label, query, asText) ? MATCH.contains : MATCH.none;
}

/**
 * The list while typing, in four groups:
 * 1. Labels or words in them that start with the query: the ones you can add, and (multiple) the selected ones that are
 *    strong (`STRONG_COVERAGE`).
 * 2. The proposal: Enter takes the typed text unless a group 1 entry does.
 * 3. The ones you can add that only contain the query.
 * 4. (multiple) The other selected ones, so Enter adds rather than removes.
 * Within a group: by `MATCH`, then the larger share of the label typed, then the list's order. Only orders: Base UI
 * still filters.
 */
function rankedForQuery({
  entries,
  query,
  proposal,
  selected,
  filter,
}: {
  entries: ReadonlyArray<Entry>;
  query: string;
  proposal: CustomProposal | null;
  selected: ReadonlySet<Entry>;
  filter: TextFilter;
}): ReadonlyArray<Entry> {
  const matches = new Map(entries.map((entry) => [entry, matchOf({ label: entry.label, query, filter })]));
  const match = (entry: Entry) => matches.get(entry)!;
  const coverage = (entry: Entry) => Math.min(1, query.length / entry.label.length);
  const startsWord = (entry: Entry) => match(entry) < MATCH.contains;
  const strong = (entry: Entry) => startsWord(entry) && coverage(entry) >= STRONG_COVERAGE;
  // `sort` is stable: equal entries keep the list's order.
  const best = (list: ReadonlyArray<Entry>) =>
    [...list].sort((a, b) => match(a) - match(b) || coverage(b) - coverage(a));
  const leads = (entry: Entry) => (selected.has(entry) ? strong(entry) : startsWord(entry));
  return [
    ...best(entries.filter(leads)),
    ...(proposal ? [proposal] : []),
    ...best(entries.filter((entry) => !leads(entry) && !selected.has(entry))),
    ...best(entries.filter((entry) => !leads(entry) && selected.has(entry))),
  ];
}

/**
 * The query becomes a proposal unless it is empty, or names a value or an item's label as Base UI matches: case, accents
 * and punctuation aside, so “onboarding” does not propose a second Onboarding.
 */
function proposalFor({
  query,
  items,
  values,
  filter,
}: {
  query: string;
  items: ReadonlyArray<SelectOption>;
  values: ReadonlyArray<string>;
  filter: TextFilter;
}): CustomProposal | null {
  const text = query.trim();
  if (text === '') return null;
  const named = [...values, ...items.map((item) => item.label)];
  if (named.some((name) => isSameText({ a: name, b: text, filter }))) return null;
  return customProposal(text);
}

/**
 * One `CustomValue` per text, kept while the texts stay the same. Base UI resets the input to the selected label when
 * the value changes identity or drops out of `items`; either would undo every keystroke. Keyed by the texts, not by
 * `items`, so a caller's new `items` array on every render keeps them too.
 */
function useCustomValues(texts: ReadonlyArray<string>): ReadonlyArray<CustomValue> {
  const key = JSON.stringify(texts);
  return React.useMemo(() => (JSON.parse(key) as string[]).map(customValue), [key]);
}

/** What the root shares with its parts. */
interface ComboboxContextValue {
  /** The chips field the popup anchors to. */
  readonly chips: HTMLDivElement | null;
  readonly setChips: (element: HTMLDivElement | null) => void;
  readonly open: boolean;
  readonly virtualized: boolean;
  readonly virtualizerRef: React.RefObject<Virtualizer | null>;
  /** The wording of the custom rows; `null` without `allowCustom`. */
  readonly custom: {
    readonly label: string;
    readonly optionLabel: (text: React.ReactNode) => React.ReactNode;
  } | null;
  /** The note that marks a single custom value, while there is one: the input's description. */
  readonly customNoteId: string | undefined;
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
   * A value is an item's value or the typed text. While the query names no item, a row takes it: after the items whose
   * label or a word in it starts with the query, so Enter picks it unless one does.
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
  const { locale, labels: copy } = useLocale();
  const customLabel = props.customLabel ?? copy.custom;
  // `multiple`: a plain `contains`, the one Base UI filters with; the single variant also matches the selection.
  const filter = ComboboxPrimitive.useFilter({ locale, multiple: true });
  const [closingQuery, setClosingQuery] = React.useState('');
  const open = root.open ?? openState;
  // The query the list shows. While the popup closes, the one it closed with: Base UI clears a multiple combobox's
  // input on close, and the rows would jump back to the caller's order during the exit animation.
  const listQuery = open ? query : closingQuery;

  const itemsByValue = React.useMemo(() => new Map(items.map((item) => [item.value, item])), [items]);

  // Single and multiple meet here: from now on, a list of values.
  const allowCustom = props.allowCustom === true;
  const value = props.value;
  const values = React.useMemo(
    (): ReadonlyArray<string> => (value === null ? [] : typeof value === 'string' ? [value] : value),
    [value],
  );
  const customValues = useCustomValues(
    allowCustom ? values.filter((text) => isCustomText({ text, itemsByValue })) : [],
  );
  const selectedEntries = React.useMemo((): Entry[] => {
    const customByValue = new Map(customValues.map((entry) => [entry.value, entry]));
    return values.flatMap((text) => itemsByValue.get(text) ?? customByValue.get(text) ?? []);
  }, [values, itemsByValue, customValues]);
  const selected = selectedEntries[0] ?? null;
  // Memoized: a new proposal would give `entries` a new identity, and Base UI would re-filter the list on every render.
  const proposal = React.useMemo(
    () => (allowCustom ? proposalFor({ query: listQuery, items, values, filter }) : null),
    [allowCustom, listQuery, items, values, filter],
  );

  // Items, then the custom values. While typing, ranked by the query (`rankedForQuery`). Otherwise as given, the
  // proposal last; single: the selected entry first. A single input that shows the selected label is not typing (Base
  // UI then lists every item).
  const entries = React.useMemo((): ReadonlyArray<Entry> => {
    const all: ReadonlyArray<Entry> = [...items, ...customValues];
    const showsSelected =
      !props.multiple && selected !== null && isSameText({ a: selected.label, b: listQuery, filter });
    if (listQuery !== '' && !showsSelected) {
      // Single: a pick replaces the value, so the selected entry ranks like any other.
      const sinks = new Set<Entry>(props.multiple ? selectedEntries : []);
      return rankedForQuery({ entries: all, query: listQuery, proposal, selected: sinks, filter });
    }
    return [...(props.multiple ? all : selectedFirst(all, selected)), ...(proposal ? [proposal] : [])];
  }, [props.multiple, items, customValues, selected, selectedEntries, listQuery, filter, proposal]);
  const customNoteShown = !props.multiple && selected !== null && isCustomValue(selected);

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
    locale,
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
      // Called before Base UI clears the input.
      if (!next) setClosingQuery(query);
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
        open,
        virtualized,
        virtualizerRef,
        custom: allowCustom ? { label: customLabel, optionLabel: props.customOptionLabel ?? copy.useCustom } : null,
        customNoteId: customNoteShown ? noteId : undefined,
      }}>
      {props.multiple ? (
        <ComboboxPrimitive.Root<Entry, true>
          {...shared}
          multiple
          value={selectedEntries}
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
          {customNoteShown && (
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
  const { customNoteId } = useComboboxContext();
  return (
    <ComboboxPrimitive.InputGroup render={<InputGroup className={cn('w-auto', className)} />}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        aria-describedby={customNoteId}
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
            'group/combobox-content relative flex max-h-[min(var(--available-height),23rem)] max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) flex-col overflow-hidden rounded-popup bg-popover text-popover-foreground shadow-popup [--outer-inset:var(--spacing-popup-inset)] [--outer-radius:var(--radius-popup)]',
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
  /** A row: a `ComboboxItem` with `value={option}`. Custom values and the proposal render themselves. */
  readonly children: (option: SelectOption) => React.ReactNode;
  readonly className?: string;
}

/** The rows. With `Combobox virtualized` only those in view render, measured as they mount. */
function ComboboxList({ children, className }: ComboboxListProps) {
  const { virtualized } = useComboboxContext();
  const row = (entry: Entry) =>
    isCustomValue(entry) ? (
      <CustomValueRow entry={entry} />
    ) : isCustomProposal(entry) ? (
      <CustomProposalRow entry={entry} />
    ) : (
      children(entry)
    );
  if (virtualized) return <VirtualizedRows row={row} className={className} />;
  return (
    <ComboboxPrimitive.List
      data-slot='combobox-list'
      className={cn(
        'min-h-0 flex-1 scroll-py-popup-inset overflow-y-auto overscroll-contain p-popup-inset data-empty:p-0',
        className,
      )}>
      {(entry: Entry) => <React.Fragment key={entryKey(entry)}>{row(entry)}</React.Fragment>}
    </ComboboxPrimitive.List>
  );
}

function VirtualizedRows({
  row,
  className,
}: {
  row: (entry: Entry) => React.ReactNode;
  className?: string | undefined;
}) {
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
    // No paddingStart/End: the listbox's `p-popup-inset` is the one inset, on every side, so a row's `rounded-inner` stays
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
    <ComboboxPrimitive.List
      data-slot='combobox-list'
      className={cn('overflow-hidden p-popup-inset data-empty:p-0', className)}>
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
 * A menu row (`--spacing-menu-item`). The check leads in its own icon-wide column, kept empty when unselected, so labels
 * line up; the same place as the indicator of a menu's checkbox item. Long labels wrap, except in a virtualized list, where a row keeps to one line.
 */
function ComboboxItem({ className, children, indicator, style, ...props }: ComboboxItemProps) {
  const virtual = React.use(VirtualRowContext);
  return (
    <ComboboxPrimitive.Item
      data-slot='combobox-item'
      className={cn(
        "grid w-full cursor-default grid-cols-[var(--spacing-icon)_minmax(0,1fr)] items-center gap-row-gap rounded-inner px-menu-item-pad py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-highlight data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon",
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
      <div className={cn('col-start-2 flex min-w-0 items-center gap-row-gap', virtual ? 'truncate' : 'wrap-anywhere')}>
        {children}
      </div>
    </ComboboxPrimitive.Item>
  );
}

/** A custom value's row: its text, marked with `customLabel`. */
function CustomValueRow({ entry }: { entry: CustomValue }) {
  const { custom } = useComboboxContext();
  if (!custom) return null;
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

/** The proposal's row, worded by `customOptionLabel`. */
function CustomProposalRow({ entry }: { entry: CustomProposal }) {
  const { custom } = useComboboxContext();
  if (!custom) return null;
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
      className={cn(
        'text-center text-body text-muted-foreground not-empty:px-menu-item-pad not-empty:py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)]',
        className,
      )}
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
        // `control-xs` chips centered in a `control` row (the padding + the border); rows wrap a chip gap apart.
        // Multi-line once they wrap: the area radius.
        'flex min-h-control flex-wrap items-center gap-tight p-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] text-body [--field-radius:var(--radius-area)]',
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
        // A flat 4% fill, no lift. `control-xs`, centered in the `control` row: `rounded-inner` follows the field's curve.
        'flex h-control-xs w-fit items-center rounded-inner bg-foreground/4 pl-(--field-chip-pad-x) text-caption font-medium whitespace-nowrap text-foreground [--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)] aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed dark:bg-foreground/8',
        className,
      )}
      {...props}>
      {children}
      <ComboboxPrimitive.ChipRemove
        aria-label={removeLabel}
        // The full chip height is the hit area; only the glyph shows, brightening on hover.
        className='flex h-full shrink-0 cursor-pointer items-center px-(--field-chip-pad-x) text-faint-foreground outline-none hover:text-foreground focus-visible:text-foreground'
        data-slot='combobox-chip-remove'>
        <IconX className='pointer-events-none size-icon-sm' />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot='combobox-chip-input'
      // Text on the field's padding line when empty (`field-pad` less the chips' inset); a chip gap after a chip.
      className={cn(
        'h-control-xs min-w-16 flex-1 pl-[calc(var(--spacing-field-pad)-calc((var(--spacing-control)-var(--spacing-control-xs))/2))] outline-none max-md:text-[1rem] placeholder:text-faint-foreground [[data-slot=combobox-chip]+&]:pl-tight',
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
  isCustomValue,
};
export type { CustomValue };

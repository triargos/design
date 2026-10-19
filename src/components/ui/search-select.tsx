import { PencilLineIcon, PlusIcon } from 'lucide-react';
import * as React from 'react';
import { useUiStrings } from '~/lib/ui-config';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxValue,
  useComboboxAnchor,
} from '~/components/ui/combobox';
import { FieldDescription } from '~/components/ui/field';
import { FieldReveal } from '~/components/ui/field-reveal';
import {
  useVirtualizedCombobox,
  VirtualizedComboboxList,
  type VirtualizerInstance,
} from '~/components/ui/virtualized-combobox';

type SearchSelectKey = string | number;

interface SearchSelectBaseProps<Item, Key extends SearchSelectKey> {
  readonly items: ReadonlyArray<Item>;
  /** Equality, React key, and the value handed to `onValueChange`. */
  readonly itemKey: (item: Item) => Key;
  /** Filtering, the input text, the chip text. */
  readonly itemLabel: (item: Item) => string;
  /** Row and chip content; default: the label, and a `description` field muted beside it. */
  readonly renderItem?: (item: Item) => React.ReactNode;
  readonly placeholder?: string;
  /** Default: common `select.noItems`. */
  readonly emptyText?: string;
  /** Shows common `select.pending` in place of the empty text. */
  readonly pending?: boolean;
  readonly id?: string;
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  readonly onBlur?: () => void;
  /** The field. */
  readonly className?: string;
}

interface SearchSelectSingleProps<Item, Key extends SearchSelectKey> extends SearchSelectBaseProps<Item, Key> {
  readonly multiple?: false;
  readonly allowCustom?: false;
  readonly value: Key | null;
  readonly onValueChange: (key: Key | null) => void;
}

interface SearchSelectMultipleProps<Item, Key extends SearchSelectKey> extends SearchSelectBaseProps<Item, Key> {
  readonly multiple: true;
  readonly allowCustom?: false;
  readonly value: ReadonlyArray<Key>;
  readonly onValueChange: (keys: Key[]) => void;
}

/**
 * One value, from the list or typed: the value is a plain string, an item's key or the typed text. A value that is no
 * item's key is custom. While the query matches no item's label, the list ends in a row that takes the query; Enter
 * picks it once nothing else matches. A custom value folds open a note below the field.
 */
interface SearchSelectCustomProps<Item> extends SearchSelectBaseProps<Item, string> {
  readonly multiple?: false;
  readonly allowCustom: true;
  readonly value: string | null;
  readonly onValueChange: (value: string | null) => void;
}

export type SearchSelectProps<Item, Key extends SearchSelectKey> =
  | SearchSelectSingleProps<Item, Key>
  | SearchSelectMultipleProps<Item, Key>
  | (Key extends string ? SearchSelectCustomProps<Item> : never);

function DefaultItem({ label, item }: { label: string; item: unknown }) {
  const description =
    typeof item === 'object' && item !== null && 'description' in item && typeof item.description === 'string'
      ? item.description
      : undefined;
  return (
    <>
      <span className='truncate'>{label}</span>
      {description && <span className='truncate text-caption text-muted-foreground'>{description}</span>}
    </>
  );
}

/**
 * A select you can type into, for any list length: the list is always virtualized. One value (`ComboboxInput`, clear
 * button), many (`multiple`, chips in the field), or one that may be typed (`allowCustom`). Not bound to a form: wire
 * it through `Controller` + `Field`. For grouped lists or custom composition, build on `Combobox` + `ComboboxList`.
 */
export function SearchSelect<Item, Key extends SearchSelectKey>(props: SearchSelectProps<Item, Key>) {
  return props.allowCustom ? <SearchSelectCustom {...props} /> : <SearchSelectPick {...props} />;
}

function SearchSelectPick<Item, Key extends SearchSelectKey>(
  props: SearchSelectSingleProps<Item, Key> | SearchSelectMultipleProps<Item, Key>,
) {
  const {
    items,
    itemKey,
    itemLabel,
    renderItem,
    placeholder,
    emptyText,
    pending = false,
    id,
    invalid,
    disabled,
    onBlur,
    className,
  } = props;
  const strings = useUiStrings();
  const [open, setOpen] = React.useState(false);
  const virtualizerRef = React.useRef<VirtualizerInstance | null>(null);
  const { onItemHighlighted } = useVirtualizedCombobox({ open, virtualizerRef });
  const anchorRef = useComboboxAnchor();

  const itemsByKey = React.useMemo(() => new Map(items.map((item) => [itemKey(item), item])), [items, itemKey]);
  const isItemEqualToValue = (a: Item, b: Item) => itemKey(a) === itemKey(b);
  const content = (item: Item) => renderItem?.(item) ?? <DefaultItem label={itemLabel(item)} item={item} />;
  const empty = pending ? strings.selectPending : (emptyText ?? strings.selectEmpty);

  const popup = (
    <ComboboxContent anchor={props.multiple ? anchorRef : undefined}>
      <ComboboxEmpty>{empty}</ComboboxEmpty>
      <VirtualizedComboboxList open={open} virtualizerRef={virtualizerRef}>
        {content}
      </VirtualizedComboboxList>
    </ComboboxContent>
  );

  if (props.multiple) {
    const selected = props.value.flatMap((key) => itemsByKey.get(key) ?? []);
    const { onValueChange } = props;
    return (
      <Combobox
        virtualized
        multiple
        items={items}
        value={selected}
        onValueChange={(next: Item[]) => onValueChange(next.map((item) => itemKey(item)))}
        itemToStringLabel={itemLabel}
        itemToStringValue={(item: Item) => String(itemKey(item))}
        isItemEqualToValue={isItemEqualToValue}
        open={open}
        onOpenChange={setOpen}
        onItemHighlighted={onItemHighlighted}
        disabled={disabled}>
        <ComboboxChips ref={anchorRef} aria-invalid={invalid || undefined} className={className}>
          <ComboboxValue>
            {(value: Item[]) =>
              value.map((item) => (
                <ComboboxChip key={itemKey(item)}>
                  <span className='flex min-w-0 items-center gap-1.5'>{renderItem?.(item) ?? itemLabel(item)}</span>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput
            id={id}
            placeholder={selected.length === 0 ? placeholder : undefined}
            onBlur={onBlur}
            disabled={disabled}
          />
        </ComboboxChips>
        {popup}
      </Combobox>
    );
  }

  const selected = props.value === null ? null : (itemsByKey.get(props.value) ?? null);
  const { onValueChange } = props;
  return (
    <Combobox
      virtualized
      items={items}
      value={selected}
      onValueChange={(next: Item | null) => onValueChange(next === null ? null : itemKey(next))}
      itemToStringLabel={itemLabel}
      itemToStringValue={(item: Item) => String(itemKey(item))}
      isItemEqualToValue={isItemEqualToValue}
      open={open}
      onOpenChange={setOpen}
      onItemHighlighted={onItemHighlighted}
      disabled={disabled}>
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        showClear
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className={className}
      />
      {popup}
    </Combobox>
  );
}

/** A typed value: not an item, its text is the value. */
class CustomEntry {
  constructor(readonly text: string) {}
}

function SearchSelectCustom<Item>({
  items,
  itemKey,
  itemLabel,
  renderItem,
  placeholder,
  emptyText,
  pending = false,
  id,
  invalid,
  disabled,
  onBlur,
  className,
  value,
  onValueChange,
}: SearchSelectCustomProps<Item>) {
  type Entry = Item | CustomEntry;
  const strings = useUiStrings();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const virtualizerRef = React.useRef<VirtualizerInstance | null>(null);
  const { onItemHighlighted } = useVirtualizedCombobox({ open, virtualizerRef });
  const noteId = React.useId();

  const itemsByKey = React.useMemo(() => new Map(items.map((item) => [itemKey(item), item])), [items, itemKey]);
  const labels = React.useMemo(() => new Set(items.map((item) => itemLabel(item).toLowerCase())), [items, itemLabel]);

  const selected: Entry | null = !value ? null : (itemsByKey.get(value) ?? new CustomEntry(value));
  const custom = selected instanceof CustomEntry;

  // The typed row while the query names no item; else the custom value, so it shows selected in the list.
  const entries = React.useMemo((): ReadonlyArray<Entry> => {
    const typed = query.trim();
    const extra = typed !== '' && !labels.has(typed.toLowerCase()) ? typed : custom ? value : null;
    return extra ? [...items, new CustomEntry(extra)] : items;
  }, [items, labels, query, custom, value]);

  const label = (entry: Entry) => (entry instanceof CustomEntry ? entry.text : itemLabel(entry));
  const isPicked = (entry: Entry) => entry instanceof CustomEntry && entry.text === value;
  const content = (entry: Entry) => {
    if (!(entry instanceof CustomEntry)) {
      return renderItem?.(entry) ?? <DefaultItem label={itemLabel(entry)} item={entry} />;
    }
    if (isPicked(entry)) {
      return (
        <>
          <span className='truncate'>{entry.text}</span>
          <span className='truncate text-caption text-muted-foreground in-data-highlighted:text-foreground'>
            {strings.selectCustom}
          </span>
        </>
      );
    }
    // One line, as tall as the other rows: the typed text truncates, the verb stays. A virtualized row cannot widen
    // the popup.
    return (
      // gap-1: a word space, not the row's 8px gap.
      <span className='flex min-w-0 gap-1'>
        {/* The quotes stay outside the truncation, so a cut text still closes. */}
        <span className='flex min-w-0'>
          „<span className='truncate'>{entry.text}</span>“
        </span>
        <span className='shrink-0'>{strings.selectUseCustom}</span>
      </span>
    );
  };
  const empty = pending ? strings.selectPending : (emptyText ?? strings.selectEmpty);

  return (
    <div className={className}>
      <Combobox
        virtualized
        items={entries}
        value={selected}
        onValueChange={(next: Entry | null) =>
          onValueChange(next === null ? null : next instanceof CustomEntry ? next.text : itemKey(next))
        }
        onInputValueChange={setQuery}
        itemToStringLabel={label}
        itemToStringValue={(entry: Entry) => (entry instanceof CustomEntry ? entry.text : itemKey(entry))}
        isItemEqualToValue={(a: Entry, b: Entry) =>
          a instanceof CustomEntry || b instanceof CustomEntry
            ? a instanceof CustomEntry && b instanceof CustomEntry && a.text === b.text
            : itemKey(a) === itemKey(b)
        }
        open={open}
        onOpenChange={setOpen}
        onItemHighlighted={onItemHighlighted}
        disabled={disabled}>
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          showClear
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
          aria-describedby={custom ? noteId : undefined}
          disabled={disabled}
        />
        <ComboboxContent>
          <ComboboxEmpty>{empty}</ComboboxEmpty>
          <VirtualizedComboboxList
            open={open}
            virtualizerRef={virtualizerRef}
            indicator={(entry: Entry) =>
              entry instanceof CustomEntry && !isPicked(entry) ? (
                <PlusIcon className='text-muted-foreground' />
              ) : undefined
            }>
            {content}
          </VirtualizedComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldReveal show={custom}>
        <FieldDescription id={noteId} className='flex items-center gap-1.5'>
          <PencilLineIcon aria-hidden className='size-3.5 shrink-0' />
          {strings.selectCustomNote}
        </FieldDescription>
      </FieldReveal>
    </div>
  );
}

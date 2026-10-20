import { PlusIcon } from 'lucide-react';
import * as React from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxValue,
  ComboboxVirtualizedList,
} from '~/components/ui/combobox';
import type { SelectOption } from '~/components/ui/select';

interface SearchSelectBaseProps {
  readonly items: ReadonlyArray<SelectOption>;
  readonly placeholder?: string;
  /** Shown while no item matches; pass a loading text while the items load. */
  readonly emptyText?: string;
  readonly id?: string;
  /** Without a visible label. */
  readonly 'aria-label'?: string;
  readonly 'aria-invalid'?: boolean;
  readonly disabled?: boolean;
  readonly onBlur?: () => void;
  /** The field. */
  readonly className?: string;
}

interface SearchSelectSingleProps extends SearchSelectBaseProps {
  readonly multiple?: false;
  readonly allowCustom?: false;
  readonly value: string | null;
  readonly onValueChange: (value: string | null) => void;
}

interface SearchSelectMultipleProps extends SearchSelectBaseProps {
  readonly multiple: true;
  readonly allowCustom?: false;
  readonly value: ReadonlyArray<string>;
  readonly onValueChange: (values: string[]) => void;
}

/**
 * One value, from the list or typed: an item's value or the typed text. While the query matches no item's label, the
 * list ends in a row that takes the query; Enter picks it once nothing else matches.
 */
interface SearchSelectCustomProps extends SearchSelectBaseProps {
  readonly multiple?: false;
  readonly allowCustom: true;
  readonly value: string | null;
  readonly onValueChange: (value: string | null) => void;
  /** Marks a typed value: in its row, and as the field's description. */
  readonly customLabel?: string;
  /** The row that takes the query; `text` is the typed text, cut to fit. */
  readonly customOptionLabel?: (text: React.ReactNode) => React.ReactNode;
}

export type SearchSelectProps = SearchSelectSingleProps | SearchSelectMultipleProps | SearchSelectCustomProps;

const NO_RESULTS = 'No results';

const optionProps = {
  virtualized: true,
  itemToStringLabel: (option: SelectOption) => option.label,
  itemToStringValue: (option: SelectOption) => option.value,
  isItemEqualToValue: (a: SelectOption, b: SelectOption) => a.value === b.value,
};

function OptionRow({ option }: { option: SelectOption }) {
  return (
    <>
      <span className='truncate'>{option.label}</span>
      {option.description && <span className='truncate text-caption text-muted-foreground'>{option.description}</span>}
    </>
  );
}

/**
 * A select you can type into, for any list length: the list is always virtualized. One value (a clear button), many
 * (`multiple`, chips in the field), or one that may be typed (`allowCustom`). Type to filter; Enter picks the first
 * match. For grouped lists or another trigger, compose `Combobox`.
 */
export function SearchSelect(props: SearchSelectProps) {
  if (props.allowCustom) return <SearchSelectCustom {...props} />;
  if (props.multiple) return <SearchSelectMultiple {...props} />;
  return <SearchSelectSingle {...props} />;
}

function useOptionsByValue(items: ReadonlyArray<SelectOption>) {
  return React.useMemo(() => new Map(items.map((option) => [option.value, option])), [items]);
}

function SearchSelectSingle({
  items,
  placeholder,
  emptyText = NO_RESULTS,
  id,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  disabled,
  onBlur,
  className,
  value,
  onValueChange,
}: SearchSelectSingleProps) {
  const optionsByValue = useOptionsByValue(items);
  const selected = (value === null ? undefined : optionsByValue.get(value)) ?? null;
  return (
    <Combobox
      {...optionProps}
      items={selectedFirst(items, selected)}
      value={selected}
      onValueChange={(next: SelectOption | null) => onValueChange(next?.value ?? null)}
      disabled={disabled}>
      <ComboboxInput
        id={id}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid || undefined}
        placeholder={placeholder}
        onBlur={onBlur}
        disabled={disabled}
        className={className}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxVirtualizedList itemKey={(option: SelectOption) => option.value}>
          {(option: SelectOption) => <OptionRow option={option} />}
        </ComboboxVirtualizedList>
      </ComboboxContent>
    </Combobox>
  );
}

function SearchSelectMultiple({
  items,
  placeholder,
  emptyText = NO_RESULTS,
  id,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  disabled,
  onBlur,
  className,
  value,
  onValueChange,
}: SearchSelectMultipleProps) {
  const optionsByValue = useOptionsByValue(items);
  const selected = value.flatMap((key) => optionsByValue.get(key) ?? []);
  return (
    <Combobox
      {...optionProps}
      multiple
      items={items}
      value={selected}
      onValueChange={(next: SelectOption[]) => onValueChange(next.map((option) => option.value))}
      disabled={disabled}>
      <ComboboxChips aria-invalid={ariaInvalid || undefined} className={className}>
        <ComboboxValue>
          {(options: SelectOption[]) =>
            options.map((option) => <ComboboxChip key={option.value}>{option.label}</ComboboxChip>)
          }
        </ComboboxValue>
        <ComboboxChipsInput
          id={id}
          aria-label={ariaLabel}
          placeholder={selected.length === 0 ? placeholder : undefined}
          onBlur={onBlur}
          disabled={disabled}
        />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxVirtualizedList itemKey={(option: SelectOption) => option.value}>
          {(option: SelectOption) => <OptionRow option={option} />}
        </ComboboxVirtualizedList>
      </ComboboxContent>
    </Combobox>
  );
}

/** The selected entry leads the list, so a reopened select shows it first; the rest keep their order. */
function selectedFirst<Entry>(entries: ReadonlyArray<Entry>, selected: Entry | null): ReadonlyArray<Entry> {
  if (selected === null || !entries.includes(selected)) return entries;
  return [selected, ...entries.filter((entry) => entry !== selected)];
}

/** A typed value: not an item, its text is the value. */
class CustomEntry {
  constructor(readonly text: string) {}
}

type Entry = SelectOption | CustomEntry;

const entryText = (entry: Entry) => (entry instanceof CustomEntry ? entry.text : entry.label);

function SearchSelectCustom({
  items,
  placeholder,
  emptyText = NO_RESULTS,
  id,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  disabled,
  onBlur,
  className,
  value,
  onValueChange,
  customLabel = 'Custom',
  customOptionLabel = (text) => <>Use “{text}”</>,
}: SearchSelectCustomProps) {
  const [query, setQuery] = React.useState('');
  const noteId = React.useId();

  const optionsByValue = useOptionsByValue(items);
  const labels = React.useMemo(() => new Set(items.map((option) => option.label.toLowerCase())), [items]);

  // Base UI resets the input to the selected label when the value changes identity or drops out of `items`; either
  // would undo every keystroke. So: one `CustomEntry` per custom text, and it stays in `items`.
  const listed = value === null ? undefined : optionsByValue.get(value);
  const custom = Boolean(value) && listed === undefined;
  const customEntry = React.useMemo(() => (custom && value ? new CustomEntry(value) : null), [custom, value]);
  const selected: Entry | null = listed ?? customEntry;

  // The typed row comes last, while the query names neither an item nor the custom value.
  const entries = React.useMemo((): ReadonlyArray<Entry> => {
    const typed = query.trim();
    const typedRow =
      typed !== '' && typed !== value && !labels.has(typed.toLowerCase()) ? [new CustomEntry(typed)] : [];
    const all: ReadonlyArray<Entry> = customEntry !== null ? [...items, customEntry] : items;
    return [...selectedFirst(all, selected), ...typedRow];
  }, [items, labels, query, customEntry, value, selected]);

  const isPicked = (entry: Entry) => entry instanceof CustomEntry && entry.text === value;
  const content = (entry: Entry) => {
    if (!(entry instanceof CustomEntry)) return <OptionRow option={entry} />;
    if (isPicked(entry)) {
      return (
        <>
          <span className='truncate'>{entry.text}</span>
          {/* At the row's end: the value truncates first, the hint keeps its width. */}
          <span className='ms-auto shrink-0 text-caption text-muted-foreground in-data-highlighted:text-foreground'>
            {customLabel}
          </span>
        </>
      );
    }
    // One line, as tall as the other rows: the typed text truncates, the words and quotes around it keep their width.
    return (
      <span className='flex min-w-0 whitespace-pre'>
        {customOptionLabel(<span className='truncate'>{entry.text}</span>)}
      </span>
    );
  };

  return (
    <div className={className}>
      <Combobox
        virtualized
        items={entries}
        value={selected}
        onValueChange={(next: Entry | null) =>
          onValueChange(next === null ? null : next instanceof CustomEntry ? next.text : next.value)
        }
        onInputValueChange={setQuery}
        itemToStringLabel={entryText}
        itemToStringValue={(entry: Entry) => (entry instanceof CustomEntry ? entry.text : entry.value)}
        isItemEqualToValue={(a: Entry, b: Entry) =>
          a instanceof CustomEntry || b instanceof CustomEntry
            ? a instanceof CustomEntry && b instanceof CustomEntry && a.text === b.text
            : a.value === b.value
        }
        disabled={disabled}>
        <ComboboxInput
          id={id}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid || undefined}
          aria-describedby={custom ? noteId : undefined}
          placeholder={placeholder}
          onBlur={onBlur}
          disabled={disabled}
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
          <ComboboxVirtualizedList
            itemKey={(entry: Entry) => (entry instanceof CustomEntry ? `custom:${entry.text}` : entry.value)}
            indicator={(entry: Entry) =>
              entry instanceof CustomEntry && !isPicked(entry) ? (
                <PlusIcon className='text-muted-foreground' />
              ) : undefined
            }>
            {content}
          </ComboboxVirtualizedList>
        </ComboboxContent>
      </Combobox>
      {/* No visible mark: the input reads the note, the list row shows the same label. */}
      {custom && (
        <span id={noteId} className='sr-only'>
          {customLabel}
        </span>
      )}
    </div>
  );
}

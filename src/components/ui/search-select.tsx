import * as React from 'react';
import { useTranslation } from 'react-i18next';

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
  readonly value: Key | null;
  readonly onValueChange: (key: Key | null) => void;
}

interface SearchSelectMultipleProps<Item, Key extends SearchSelectKey> extends SearchSelectBaseProps<Item, Key> {
  readonly multiple: true;
  readonly value: ReadonlyArray<Key>;
  readonly onValueChange: (keys: Key[]) => void;
}

export type SearchSelectProps<Item, Key extends SearchSelectKey> =
  | SearchSelectSingleProps<Item, Key>
  | SearchSelectMultipleProps<Item, Key>;

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
 * button) or many (`multiple`, chips in the field). Not bound to a form: wire it through `Controller` + `Field`. For
 * grouped lists or custom composition, build on `Combobox` + `ComboboxList` instead.
 */
export function SearchSelect<Item, Key extends SearchSelectKey>(props: SearchSelectProps<Item, Key>) {
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
  const { t } = useTranslation('common');
  const [open, setOpen] = React.useState(false);
  const virtualizerRef = React.useRef<VirtualizerInstance | null>(null);
  const { onItemHighlighted } = useVirtualizedCombobox({ open, virtualizerRef });
  const anchorRef = useComboboxAnchor();

  const itemsByKey = React.useMemo(() => new Map(items.map((item) => [itemKey(item), item])), [items, itemKey]);
  const isItemEqualToValue = (a: Item, b: Item) => itemKey(a) === itemKey(b);
  const content = (item: Item) => renderItem?.(item) ?? <DefaultItem label={itemLabel(item)} item={item} />;
  const empty = pending ? t(($) => $.select.pending) : (emptyText ?? t(($) => $.select.noItems));

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

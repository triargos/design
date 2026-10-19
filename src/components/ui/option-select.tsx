import * as React from 'react';
import { useUiStrings } from '~/lib/ui-config';

import { FieldReveal } from '~/components/ui/field-reveal';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '~/components/ui/select';

type OptionSelectKey = string | number;

interface OptionSelectBaseProps<Item, Key extends OptionSelectKey> {
  readonly items: ReadonlyArray<Item>;
  /** Equality, React key, and the value handed to `onValueChange`. */
  readonly itemKey: (item: Item) => Key;
  /** The row and the trigger text. */
  readonly itemLabel: (item: Item) => string;
  readonly placeholder?: string;
  readonly id?: string;
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  readonly onBlur?: () => void;
  readonly size?: 'sm' | 'default';
  /** The trigger; with `allowCustom`, the trigger and its text field. */
  readonly className?: string;
}

interface OptionSelectPickProps<Item, Key extends OptionSelectKey> extends OptionSelectBaseProps<Item, Key> {
  readonly allowCustom?: false;
  readonly value: Key | null;
  readonly onValueChange: (key: Key) => void;
}

/**
 * The value is a plain string: an item's key or the typed text. The list ends, after a separator, in an „Andere
 * angeben …" row; picking it emits '' and folds open a text field, hung off the select, that takes focus. A value
 * that is no item's key opens with the text field.
 */
interface OptionSelectCustomProps<Item> extends OptionSelectBaseProps<Item, string> {
  readonly allowCustom: true;
  readonly value: string | null;
  readonly onValueChange: (value: string) => void;
  /** The text field's accessible name; default: common `select.otherLabel`. */
  readonly otherLabel?: string;
  /** Default: common `select.otherPlaceholder`. */
  readonly otherPlaceholder?: string;
}

export type OptionSelectProps<Item, Key extends OptionSelectKey> =
  | OptionSelectPickProps<Item, Key>
  | (Key extends string ? OptionSelectCustomProps<Item> : never);

/** The select's own value for the other row; never emitted, so no key or typed text can collide with it. */
const OTHER = { other: true } as const;

/**
 * A select over `items`, with SearchSelect's API, for short lists: no typing, no virtualization. `allowCustom` adds
 * an „Andere" row with a text field for a value outside the list. Not bound to a form: wire it through `Controller` +
 * `Field`. For long lists or a custom value typed in place, `SearchSelect`.
 */
export function OptionSelect<Item, Key extends OptionSelectKey>(props: OptionSelectProps<Item, Key>) {
  const { items, itemKey, itemLabel, placeholder, id, invalid, disabled, onBlur, size, className } = props;
  type Choice = Item | typeof OTHER;
  const strings = useUiStrings();
  // The text last typed into the other field: a typed text that equals a key stays custom while it is typed.
  const [typedOther, setTypedOther] = React.useState<string | null>(null);
  const otherInput = React.useRef<HTMLInputElement>(null);
  const focusOther = React.useRef(false);

  const itemsByKey = React.useMemo(
    () => new Map<OptionSelectKey, Item>(items.map((item) => [itemKey(item), item])),
    [items, itemKey],
  );
  const listed = props.value === null ? null : (itemsByKey.get(props.value) ?? null);
  const otherChosen =
    props.allowCustom === true && props.value !== null && (listed === null || props.value === typedOther);
  const selected: Choice | null = otherChosen ? OTHER : listed;

  const select = (
    <Select<Choice | null>
      value={selected}
      onValueChange={(next) => {
        if (next === null) return;
        if (next === OTHER) {
          if (!props.allowCustom) return;
          focusOther.current = true;
          setTypedOther('');
          props.onValueChange('');
          return;
        }
        setTypedOther(null);
        // `Item | typeof OTHER` does not narrow on a generic `Item`.
        const item = next as Item;
        if (props.allowCustom) props.onValueChange(props.itemKey(item));
        else props.onValueChange(props.itemKey(item));
      }}
      itemToStringLabel={(choice) =>
        choice === null ? '' : choice === OTHER ? strings.selectOther : itemLabel(choice as Item)
      }
      isItemEqualToValue={(a, b) =>
        a === OTHER || b === OTHER || a === null || b === null ? a === b : itemKey(a as Item) === itemKey(b as Item)
      }
      // The popup returns focus to the trigger as it closes; move on to the text field only after that.
      onOpenChangeComplete={(open) => {
        if (open || !focusOther.current) return;
        focusOther.current = false;
        otherInput.current?.focus();
      }}
      disabled={disabled}>
      <SelectTrigger
        id={id}
        size={size}
        onBlur={onBlur}
        aria-invalid={(invalid && !otherChosen) || undefined}
        className={props.allowCustom ? undefined : className}>
        <SelectValue placeholder={placeholder ?? strings.selectPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={itemKey(item)} value={item}>
            {itemLabel(item)}
          </SelectItem>
        ))}
        {props.allowCustom && (
          <>
            <SelectSeparator />
            {/* The row says what picking it does; the trigger then shows `select.other`. */}
            <SelectItem value={OTHER}>{strings.selectOtherOption}</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );

  if (!props.allowCustom) return select;
  const { onValueChange, otherLabel, otherPlaceholder } = props;
  return (
    <div className={className}>
      {select}
      <FieldReveal show={otherChosen} elbow>
        <Input
          ref={otherInput}
          aria-label={otherLabel ?? strings.selectOtherLabel}
          placeholder={otherPlaceholder ?? strings.selectOtherPlaceholder}
          value={otherChosen ? (props.value ?? '') : ''}
          onChange={(event) => {
            setTypedOther(event.target.value);
            onValueChange(event.target.value);
          }}
          onBlur={onBlur}
          aria-invalid={(invalid && otherChosen) || undefined}
          disabled={disabled}
        />
      </FieldReveal>
    </div>
  );
}

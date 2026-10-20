import * as React from 'react';

import { FieldReveal } from '~/components/ui/field-reveal';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from '~/components/ui/select';

interface OptionSelectBaseProps {
  readonly items: ReadonlyArray<SelectOption>;
  readonly value: string | null;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string;
  readonly id?: string;
  /** Without a visible label, e.g. `size='sm'` in a toolbar. */
  readonly 'aria-label'?: string;
  readonly 'aria-invalid'?: boolean;
  readonly disabled?: boolean;
  readonly onBlur?: () => void;
  readonly size?: 'sm' | 'default';
  /** The trigger; with `allowCustom`, the trigger and its text field. */
  readonly className?: string;
}

interface OptionSelectPickProps extends OptionSelectBaseProps {
  readonly allowCustom?: false;
}

/**
 * The value is an item's value or the typed text. The list ends, after a separator, in an "Other…" row; picking it
 * emits '' and folds open a text field, hung off the select, that takes focus. A value that is no item's value opens
 * with the text field.
 */
interface OptionSelectCustomProps extends OptionSelectBaseProps {
  readonly allowCustom: true;
  /** The trigger text once "other" is chosen, the row (with an ellipsis), and the text field's accessible name. */
  readonly otherLabel?: string;
  readonly otherPlaceholder?: string;
}

export type OptionSelectProps = OptionSelectPickProps | OptionSelectCustomProps;

/** The select's own value for the other row: not a string, so no item value or typed text can collide with it. */
const OTHER = { other: true } as const;

type Choice = string | typeof OTHER;

/**
 * A select over a short list of options: no typing, no virtualization. `allowCustom` adds an "Other…" row with a text
 * field for a value outside the list. For long lists or a value typed in place, `SearchSelect`.
 */
export function OptionSelect(props: OptionSelectProps) {
  const { items, value, onValueChange, placeholder = 'Select…', id, disabled, onBlur, size, className } = props;
  const invalid = props['aria-invalid'] === true;
  const otherLabel = (props.allowCustom && props.otherLabel) || 'Other';
  // The text last typed into the other field: a typed text that equals an item's value stays custom while typed.
  const [typedOther, setTypedOther] = React.useState<string | null>(null);
  const otherInput = React.useRef<HTMLInputElement>(null);
  const focusOther = React.useRef(false);

  const listed = value !== null && items.some((option) => option.value === value);
  const otherChosen = props.allowCustom === true && value !== null && (!listed || value === typedOther);
  const selected: Choice | null = otherChosen ? OTHER : listed ? value : null;

  const select = (
    <Select<Choice>
      itemToStringLabel={(choice) =>
        typeof choice === 'string' ? (items.find((option) => option.value === choice)?.label ?? choice) : otherLabel
      }
      value={selected}
      onValueChange={(next) => {
        if (typeof next !== 'string') {
          focusOther.current = true;
          setTypedOther('');
          onValueChange('');
          return;
        }
        setTypedOther(null);
        onValueChange(next);
      }}
      // The popup returns focus to the trigger as it closes; move on to the text field only after that.
      onOpenChangeComplete={(open) => {
        if (open || !focusOther.current) return;
        focusOther.current = false;
        otherInput.current?.focus();
      }}
      disabled={disabled}>
      <SelectTrigger
        id={id}
        aria-label={props['aria-label']}
        size={size}
        onBlur={onBlur}
        aria-invalid={(invalid && !otherChosen) || undefined}
        className={props.allowCustom ? undefined : className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        {props.allowCustom && (
          <>
            <SelectSeparator />
            {/* The ellipsis says a field follows; the trigger then shows the label alone. */}
            <SelectItem value={OTHER}>{otherLabel}…</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );

  if (!props.allowCustom) return select;
  return (
    <div className={className}>
      {select}
      <FieldReveal show={otherChosen} elbow>
        <Input
          ref={otherInput}
          aria-label={otherLabel}
          placeholder={props.otherPlaceholder}
          value={otherChosen ? (value ?? '') : ''}
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

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import * as React from 'react';

import { Input, inputSurfaceVariants } from '~/components/ui/input';

import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

/** An option of `Select` and `Combobox`: `value` is what `onValueChange` reports, `label` what the field shows. */
export interface SelectOption {
  readonly value: string;
  readonly label: string;
  /** Shown muted beside the label in a list row. */
  readonly description?: string;
}

/** The select's own value for the custom row: not a string, so no item value or typed text can collide with it. */
const CUSTOM = { custom: true } as const;

type Choice = string | typeof CUSTOM;

interface SelectCustomContextValue {
  readonly label: string;
  readonly chosen: boolean;
  readonly value: string;
  readonly invalid: boolean;
  readonly disabled: boolean;
  readonly inputRef: React.RefObject<HTMLInputElement | null>;
  readonly onType: (text: string) => void;
}

const SelectCustomContext = React.createContext<SelectCustomContextValue | null>(null);

const useSelectCustom = (part: string) => {
  const context = React.use(SelectCustomContext);
  if (!context) throw new Error(`${part} needs <Select allowCustom>.`);
  return context;
};

type SelectBaseProps = Omit<
  SelectPrimitive.Root.Props<string>,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'items'
  | 'multiple'
  | 'itemToStringLabel'
  | 'itemToStringValue'
  | 'isItemEqualToValue'
> & {
  readonly items: ReadonlyArray<SelectOption>;
};

type SelectProps = SelectBaseProps &
  (
    | {
        readonly allowCustom?: false;
        readonly value?: string | null;
        readonly defaultValue?: string | null;
        readonly onValueChange?: (value: string) => void;
      }
    | {
        /**
         * The value is an item's value or typed text. `SelectCustomItem` ends the list; picking it emits `''` and
         * opens `SelectCustomInput`, which takes focus. A value that is no item's value opens with the text field.
         */
        readonly allowCustom: true;
        readonly value: string | null;
        readonly onValueChange: (value: string) => void;
        /** The trigger text once the custom row is chosen, the row (with an ellipsis), the text field's name. */
        readonly customLabel?: string;
        /** Marks the trigger invalid, or the text field once the custom row is chosen. */
        readonly 'aria-invalid'?: boolean;
      }
  );

/**
 * A field that opens a short list: no typing. Values are strings; `items` gives the trigger its labels. To search or
 * for long lists, `Combobox`.
 */
function Select(props: SelectProps) {
  if (props.allowCustom) return <SelectWithCustom {...props} />;
  const { items, value, onValueChange, allowCustom: _, ...rest } = props;
  return (
    <SelectPrimitive.Root<string>
      data-slot='select'
      items={items}
      value={value}
      // Base UI reports `null` only for a null-valued item; none of ours has one.
      onValueChange={(next) => next !== null && onValueChange?.(next)}
      {...rest}
    />
  );
}

function SelectWithCustom({
  items,
  value,
  onValueChange,
  customLabel: customLabelProp,
  'aria-invalid': invalid = false,
  onOpenChangeComplete,
  disabled = false,
  children,
  ...props
}: Extract<SelectProps, { allowCustom: true }>) {
  const customLabel = customLabelProp ?? useLocale().labels.custom;
  // The text last typed: a typed text that equals an item's value stays custom while typed.
  const [typed, setTyped] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const focusInput = React.useRef(false);

  const listed = value !== null && items.some((option) => option.value === value);
  const chosen = value !== null && (!listed || value === typed);
  const selected: Choice | null = chosen ? CUSTOM : listed ? value : null;

  return (
    <SelectCustomContext
      value={{
        label: customLabel,
        chosen,
        value: chosen ? (value ?? '') : '',
        invalid,
        disabled,
        inputRef,
        onType: (text) => {
          setTyped(text);
          onValueChange(text);
        },
      }}>
      <SelectPrimitive.Root<Choice>
        data-slot='select'
        {...props}
        disabled={disabled}
        itemToStringLabel={(choice) =>
          typeof choice === 'string' ? (items.find((option) => option.value === choice)?.label ?? choice) : customLabel
        }
        value={selected}
        onValueChange={(next) => {
          if (next === null) return;
          if (typeof next !== 'string') {
            focusInput.current = true;
            setTyped('');
            onValueChange('');
            return;
          }
          setTyped(null);
          onValueChange(next);
        }}
        // The popup returns focus to the trigger as it closes; move on to the text field only after that.
        onOpenChangeComplete={(open) => {
          onOpenChangeComplete?.(open);
          if (open || !focusInput.current) return;
          focusInput.current = false;
          inputRef.current?.focus();
        }}>
        {children}
      </SelectPrimitive.Root>
    </SelectCustomContext>
  );
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group data-slot='select-group' className={cn('scroll-my-popup-inset', className)} {...props} />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot='select-value'
      className={cn('min-w-0 flex-1 truncate text-left', className)}
      {...props}
    />
  );
}

/** The field surface at the field height (`--spacing-control`), like `Input`. */
function SelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  const custom = React.use(SelectCustomContext);
  return (
    <SelectPrimitive.Trigger
      data-slot='select-trigger'
      // With the custom row chosen, the text field carries the error.
      aria-invalid={(custom ? custom.invalid && !custom.chosen : undefined) || undefined}
      className={cn(
        inputSurfaceVariants({ scope: 'self' }),
        "flex h-control w-full items-center justify-between gap-related px-[calc(var(--spacing-field-pad)-1px)] py-1 text-control whitespace-nowrap max-sm:text-[1rem] data-placeholder:text-faint-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon
        render={<IconChevronDown className='pointer-events-none size-icon text-faint-foreground' />}
      />
    </SelectPrimitive.Trigger>
  );
}

/** Below the trigger, at least as wide; scroll arrows at the ends of a list taller than the window. */
function SelectContent({
  className,
  children,
  container,
  ...props
}: SelectPrimitive.Popup.Props & Pick<SelectPrimitive.Portal.Props, 'container'>) {
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner sideOffset={4} alignItemWithTrigger={false} className='isolate z-50'>
        <SelectPrimitive.Popup
          data-slot='select-content'
          data-surface='popup'
          className={cn(
            'relative isolate z-50 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-popup bg-popover text-popover-foreground shadow-popup [--outer-inset:var(--spacing-popup-inset)] [--outer-radius:var(--radius-popup)]',
            'duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            // Reduced motion: fade only, no zoom and no slide.
            'motion-reduce:data-closed:zoom-out-100 motion-reduce:data-open:zoom-in-100 motion-reduce:data-open:slide-in-from-top-0 motion-reduce:data-open:slide-in-from-left-0',
            className,
          )}
          {...props}>
          <SelectPrimitive.ScrollUpArrow className="top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-popup-inset [&_svg:not([class*='size-'])]:size-icon">
            <IconChevronUp />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List className='p-popup-inset'>{children}</SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className="bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-popup-inset [&_svg:not([class*='size-'])]:size-icon">
            <IconChevronDown />
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
      className={cn(
        'px-menu-item-pad pt-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] pb-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/4)] text-caption font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot='select-item'
      className={cn(
        // A menu row: the text's line box centered in `--spacing-menu-item`. The check sits `menu-item-pad` from the end; the text
        // stops a gap before it.
        "relative flex w-full cursor-default items-center gap-row-gap rounded-inner py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] pr-[calc(var(--spacing-menu-item-pad)+var(--spacing-icon)+var(--spacing-control-gap))] pl-menu-item-pad text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}>
      <SelectPrimitive.ItemText className='flex min-w-0 flex-1 items-center gap-row-gap whitespace-nowrap'>
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className='pointer-events-none absolute right-menu-item-pad flex size-icon-sm items-center justify-center' />
        }>
        <IconCheck className='size-icon' />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot='select-separator'
      className={cn('pointer-events-none -mx-popup-inset my-popup-inset h-px bg-border', className)}
      {...props}
    />
  );
}

/** The last row of a `Select allowCustom`, after a `SelectSeparator`. The ellipsis says a text field follows. */
function SelectCustomItem({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { label } = useSelectCustom('SelectCustomItem');
  return (
    <SelectItem value={CUSTOM} className={className}>
      {children ?? `${label}…`}
    </SelectItem>
  );
}

/**
 * The fold of `SelectCustomInput`: grid rows 0fr ↔ 1fr, not height 0 ↔ auto, which ends on a swap back to `auto` that
 * stutters. A short critically damped spring, interruptible when the choice flips mid-fold, settled finely
 * (`restDelta`) because the value only spans 0–1fr. Reduced motion: no fold, the field fades in and out in place.
 */
const customFold = { type: 'spring', duration: 0.15, bounce: 0, restDelta: 0.001, restSpeed: 0.01 } as const;
const folded = { gridTemplateRows: '0fr', opacity: 0 } as const;
const unfolded = { gridTemplateRows: '1fr', opacity: 1 } as const;

/**
 * The text field of a `Select allowCustom`: folds open below the trigger while the custom row is chosen, the `related`
 * gap with it. A line hangs it off the trigger: from under the trigger's text (`--spacing-field-pad` in) to the middle
 * of the field, which is indented to make room. Put the trigger and it in one element.
 */
function SelectCustomInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'ref' | 'disabled'>) {
  const custom = useSelectCustom('SelectCustomInput');
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {custom.chosen && (
        <motion.div
          data-slot='select-custom-reveal'
          initial={reduceMotion ? { ...unfolded, opacity: 0 } : folded}
          animate={{ ...unfolded, transition: customFold }}
          exit={reduceMotion ? { opacity: 0 } : { ...folded, transition: customFold }}
          // -mx-1/-mb-1 + px-1/pb-1: room for the focus ring inside the clip.
          className='-mx-1 -mb-1 grid overflow-hidden'>
          {/* min-h-0: a grid item refuses to shrink below its content as the row folds to 0fr. */}
          <div className='min-h-0 overflow-hidden px-1 pb-1'>
            <div className={cn('relative pt-related pl-[calc(var(--spacing-field-pad)+1rem)]', className)}>
              <span
                aria-hidden
                className='absolute top-0 left-[calc(var(--spacing-field-pad)+3px)] h-[calc(var(--spacing-related)+var(--spacing-control)/2+2px)] w-2.5 rounded-bl-[min(var(--radius-lg),var(--radius-control-sm))] border-b border-l border-border'
              />
              <Input
                data-slot='select-custom-input'
                ref={custom.inputRef}
                aria-label={custom.label}
                aria-invalid={(custom.invalid && custom.chosen) || undefined}
                disabled={custom.disabled}
                {...props}
                value={custom.value}
                onChange={(event) => custom.onType(event.target.value)}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export {
  Select,
  SelectContent,
  SelectCustomInput,
  SelectCustomItem,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

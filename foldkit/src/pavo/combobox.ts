import { Combobox as ComboboxPrimitive } from '@foldkit/ui';
import { Array, Effect, Match, Number, Option, Order, Queue, Schema, Stream, String, pipe } from 'effect';
import { Command, Mount, Render, Update } from 'foldkit';
import * as Dom from 'foldkit/dom';
import { type Html, type HtmlBuilder, childAttributes } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { defineTaggedUnion } from 'foldkit/schema';
import { modifyFields } from 'foldkit/struct';

import { buttonVariants } from './button.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import * as Input from './input.ts';
import * as InputGroup from './input-group.ts';
import type { Child } from './part.ts';
import type { SelectOption } from './select.ts';

export const DEFAULT_CUSTOM_LABEL = 'Custom';
export const DEFAULT_CLEAR_LABEL = 'Clear';
export const DEFAULT_OPEN_LABEL = 'Open list';
export const DEFAULT_REMOVE_LABEL = 'Remove';
export const defaultCustomOptionLabel = (text: Child): ReadonlyArray<Child> => ['Use “', text, '”'];

export const Entry = defineTaggedUnion({
  Item: { value: Schema.String, label: Schema.String, description: Schema.optional(Schema.String) },
  CustomValue: { text: Schema.String },
  Proposal: { text: Schema.String },
});
export type Entry = typeof Entry.Type;

const entryLabel = (entry: Entry): string =>
  Entry.match(entry, { Item: ({ label }) => label, CustomValue: ({ text }) => text, Proposal: ({ text }) => text });

const entryValue = (entry: Entry): string =>
  Entry.match(entry, { Item: ({ value }) => value, CustomValue: ({ text }) => text, Proposal: ({ text }) => text });

const entryKey = (entry: Entry): string => `${entry._tag}:${entryValue(entry)}`;

const EMPTY_KEY = 'Empty:';

const valueOfKey = (key: string): string =>
  pipe(
    key,
    String.indexOf(':'),
    Option.match({ onNone: () => key, onSome: (separatorIndex) => key.slice(separatorIndex + 1) }),
  );

const PUNCTUATION = /[\p{P}\p{S}]/gu;
const DIACRITICS = /\p{Diacritic}/gu;
const WORD_SEPARATOR = /[\s\-_/(.]/;

const normalized = (text: string): string =>
  text.normalize('NFD').replace(DIACRITICS, '').replace(PUNCTUATION, '').toLocaleLowerCase();

const startsWithText = (text: string, query: string): boolean => normalized(text).startsWith(normalized(query));
const containsText = (text: string, query: string): boolean => normalized(text).includes(normalized(query));
const isSameText = (first: string, second: string): boolean => normalized(first) === normalized(second);

const MATCH_EXACT = 0;
const MATCH_PREFIX = 1;
const MATCH_WORD_START = 2;
const MATCH_CONTAINS = 3;
const MATCH_NONE = 4;

const STRONG_COVERAGE = 0.5;

const wordStarts = (label: string): ReadonlyArray<string> =>
  pipe(
    Array.range(1, Math.max(1, label.length - 1)),
    Array.filter((index) => WORD_SEPARATOR.test(label.charAt(index - 1))),
    Array.map((index) => label.slice(index)),
  );

const matchOf = (label: string, query: string): number => {
  if (startsWithText(label, query)) {
    return isSameText(label, query) ? MATCH_EXACT : MATCH_PREFIX;
  } else if (Array.some(wordStarts(label), (wordStart) => startsWithText(wordStart, query))) {
    return MATCH_WORD_START;
  } else if (containsText(label, query)) {
    return MATCH_CONTAINS;
  } else {
    return MATCH_NONE;
  }
};

type Ranked = Readonly<{ entry: Entry; match: number; coverage: number; isSelected: boolean }>;

const byRank: Order.Order<Ranked> = Order.combine(
  Order.mapInput(Number.Order, (ranked: Ranked) => ranked.match),
  Order.mapInput(Order.flip(Number.Order), (ranked: Ranked) => ranked.coverage),
);

const rankedForQuery = (
  entries: ReadonlyArray<Entry>,
  query: string,
  maybeProposal: Option.Option<Entry>,
  selectedValues: ReadonlyArray<string>,
): ReadonlyArray<Entry> => {
  const ranked = Array.map(entries, (entry): Ranked => ({
    entry,
    match: matchOf(entryLabel(entry), query),
    coverage: Math.min(1, query.length / Math.max(1, entryLabel(entry).length)),
    isSelected: Array.contains(selectedValues, entryValue(entry)),
  }));
  const isWordStart = (rank: Ranked): boolean => rank.match < MATCH_CONTAINS;
  const isStrong = (rank: Ranked): boolean => isWordStart(rank) && rank.coverage >= STRONG_COVERAGE;
  const leads = (rank: Ranked): boolean => (rank.isSelected ? isStrong(rank) : isWordStart(rank));
  const best = (list: ReadonlyArray<Ranked>): ReadonlyArray<Entry> =>
    Array.map(Array.sort(list, byRank), ({ entry }) => entry);
  const matching = Array.filter(ranked, (rank) => rank.match < MATCH_NONE);

  return [
    ...best(Array.filter(matching, leads)),
    ...Option.toArray(maybeProposal),
    ...best(Array.filter(matching, (rank) => !leads(rank) && !rank.isSelected)),
    ...best(Array.filter(matching, (rank) => !leads(rank) && rank.isSelected)),
  ];
};

const proposalFor = (
  query: string,
  options: ReadonlyArray<SelectOption>,
  values: ReadonlyArray<string>,
): Option.Option<Entry> => {
  const text = String.trim(query);
  const names = [...values, ...Array.map(options, ({ label }) => label)];
  if (String.isEmpty(text) || Array.some(names, (name) => isSameText(name, text))) {
    return Option.none();
  } else {
    return Option.some(Entry.Proposal({ text }));
  }
};

export type EntriesConfig = Readonly<{
  options: ReadonlyArray<SelectOption>;
  values: ReadonlyArray<string>;
  query: string;
  isMultiple: boolean;
  allowCustom: boolean;
}>;

export const entries = ({ options, values, query, isMultiple, allowCustom }: EntriesConfig): ReadonlyArray<Entry> => {
  const items = Array.map(options, ({ value, label, description }) =>
    Entry.Item({ value, label, ...(description === undefined ? {} : { description }) }),
  );
  const customValues = allowCustom
    ? pipe(
        values,
        Array.filter((value) => !Array.some(options, (option) => option.value === value)),
        Array.filter(String.isNonEmpty),
        Array.map((text) => Entry.CustomValue({ text })),
      )
    : [];
  const all = [...items, ...customValues];
  const maybeSelected = isMultiple
    ? Option.none()
    : pipe(
        values,
        Array.head,
        Option.flatMap((value) => Array.findFirst(all, (entry) => entryValue(entry) === value)),
      );
  const isShowingSelected = Option.exists(maybeSelected, (selected) => isSameText(entryLabel(selected), query));
  const maybeProposal = allowCustom ? proposalFor(query, options, values) : Option.none();

  if (String.isNonEmpty(query) && !isShowingSelected) {
    return rankedForQuery(all, query, maybeProposal, isMultiple ? values : []);
  } else {
    const selectedFirst = Option.match(maybeSelected, {
      onNone: () => all,
      onSome: (selected) => [selected, ...Array.filter(all, (entry) => entry !== selected)],
    });
    return [...selectedFirst, ...Option.toArray(maybeProposal)];
  }
};

type CachedEntries = Readonly<{ cacheKey: string; rows: ReadonlyArray<Entry> }>;

const entriesByOptions = new WeakMap<ReadonlyArray<SelectOption>, CachedEntries>();

const cachedEntries = (config: EntriesConfig): ReadonlyArray<Entry> => {
  const { options, values, query, isMultiple, allowCustom } = config;
  const cacheKey = JSON.stringify([values, query, isMultiple, allowCustom]);
  return pipe(
    Option.fromNullishOr(entriesByOptions.get(options)),
    Option.filter((cached) => cached.cacheKey === cacheKey),
    Option.match({
      onSome: ({ rows }) => rows,
      onNone: () => {
        const rows = entries(config);
        entriesByOptions.set(options, { cacheKey, rows });
        return rows;
      },
    }),
  );
};

export const labelOf = (options: ReadonlyArray<SelectOption>, value: string): string =>
  pipe(
    options,
    Array.findFirst((option) => option.value === value),
    Option.match({ onNone: () => value, onSome: ({ label }) => label }),
  );

export const isCustomValue = (options: ReadonlyArray<SelectOption>, value: string): boolean =>
  String.isNonEmpty(value) && !Array.some(options, (option) => option.value === value);

export const Model = ComboboxPrimitive.Model;
export type Model = ComboboxPrimitive.Model;

const messageCases = {
  GotComboboxMessage: { message: ComboboxPrimitive.Message },
  ClickedClear: {},
  CompletedFocusInput: {},
};

export const Message = defineMessageUnion(messageCases);
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  Selected: { value: Schema.String },
  Cleared: {},
});
export type OutMessage = typeof OutMessage.Type;

export type InitConfig = Readonly<{ id: string; inputValue?: string | undefined }>;

export const init = ({ id, inputValue = '' }: InitConfig): Model =>
  modifyFields(ComboboxPrimitive.init({ id, isAnimated: true, nullable: true }), { inputValue: () => inputValue });

export const initMultiple = ({ id }: InitConfig): Model => ComboboxPrimitive.Multi.init({ id, isAnimated: true });

const SingleBundle = ComboboxPrimitive.create<string>();
const MultiBundle = ComboboxPrimitive.Multi.create<string>();

const toGotComboboxMessage = (message: ComboboxPrimitive.Message): Message => Message.GotComboboxMessage({ message });

const FocusInput = Command.define('FocusInput', {
  args: { id: Schema.String },
  messages: [Message.CompletedFocusInput],
  execute: ({ id }) =>
    Dom.focus(`#${ComboboxPrimitive.inputId(id)}`).pipe(Effect.ignore, Effect.as(Message.CompletedFocusInput())),
});

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const liftComboboxUpdate = (
  comboboxUpdate: Update.ReturnWithOutMessage<Model, ComboboxPrimitive.Message, ComboboxPrimitive.OutMessage<string>>,
): UpdateReturn =>
  Update.withOutMessage(
    {
      model: comboboxUpdate.model,
      commands: Command.mapMessages(comboboxUpdate.commands, toGotComboboxMessage),
    },
    Option.getOrUndefined(
      Option.map(Option.fromNullishOr(comboboxUpdate.outMessage), (outMessage) =>
        ComboboxPrimitive.OutMessage.match<OutMessage, ComboboxPrimitive.OutMessage<string>>(outMessage, {
          Selected: ({ value }) => OutMessage.Selected({ value: valueOfKey(value) }),
          ClearedSelection: () => OutMessage.Cleared(),
        }),
      ),
    ),
  );

const makeUpdate =
  (comboboxUpdate: typeof SingleBundle.update) =>
  (model: Model, message: Message): UpdateReturn =>
    Message.match<UpdateReturn>(message, {
      GotComboboxMessage: ({ message: comboboxMessage }) => liftComboboxUpdate(comboboxUpdate(model, comboboxMessage)),
      ClickedClear: () => ({
        model: modifyFields(model, { inputValue: () => '' }),
        commands: [FocusInput({ id: model.id })],
        outMessage: OutMessage.Cleared(),
      }),
      CompletedFocusInput: () => ({ model }),
    });

export const update = makeUpdate(SingleBundle.update);
export const updateMultiple = makeUpdate(MultiBundle.update);

export const { inputId } = ComboboxPrimitive;

const contentClassName = cn(
  'group/combobox-content relative z-50 max-h-92 max-w-[calc(100vw-1rem)] min-w-(--button-width) overflow-x-hidden overflow-y-auto overscroll-contain rounded-popup bg-popover p-popup-inset text-popover-foreground shadow-popup outline-none [--outer-inset:var(--spacing-popup-inset)] [--outer-radius:var(--radius-popup)]',
  'origin-top transition-[opacity,scale,translate] duration-enter ease-enter data-closed:scale-95 data-closed:opacity-0 data-[placement=bottom]:data-closed:-translate-y-2 data-[placement=top]:origin-bottom data-[placement=top]:data-closed:translate-y-2',
  'motion-reduce:data-closed:translate-y-0 motion-reduce:data-closed:scale-100',
);

const itemClassName =
  "group/combobox-item grid w-full cursor-default grid-cols-[var(--spacing-icon)_minmax(0,1fr)] items-center gap-row-gap rounded-inner px-menu-item-pad py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-active:bg-highlight data-active:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon";

const emptyClassName =
  'col-span-2 text-center text-body text-muted-foreground px-menu-item-pad py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)]';

const fieldButtonClassName = buttonVariants({
  emphasis: 'ghost',
  className: InputGroup.buttonVariants({ size: 'icon-xs' }),
});

export type ItemContent = (option: SelectOption) => ReadonlyArray<Child>;

const defaultItemContent: ItemContent = ({ label }) => [label];

type SharedViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  options: ReadonlyArray<SelectOption>;
  itemContent?: ItemContent | undefined;
  emptyText?: string | undefined;
  allowCustom?: boolean | undefined;
  customLabel?: string | undefined;
  customOptionLabel?: ((text: Child) => ReadonlyArray<Child>) | undefined;
  placeholder?: string | undefined;
  ariaLabel?: string | undefined;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isDisabled?: boolean | undefined;
  className?: string | undefined;
}>;

type EntriesByKey = ReadonlyMap<string, Entry>;

const entriesByKey = (rows: ReadonlyArray<Entry>): EntriesByKey =>
  new Map(Array.map(rows, (entry): readonly [string, Entry] => [entryKey(entry), entry]));

const entryAt = (rowsByKey: EntriesByKey, key: string): Option.Option<Entry> =>
  Option.fromNullishOr(rowsByKey.get(key));

const displayTextAt = (rowsByKey: EntriesByKey, key: string): string =>
  Option.match(entryAt(rowsByKey, key), { onNone: () => '', onSome: entryLabel });

type EntryContentConfig = Pick<SharedViewConfig<unknown>, 'itemContent' | 'customLabel' | 'customOptionLabel'>;

const entryContentFor =
  <ParentMessage>(config: EntryContentConfig, labelClassName: string, h: HtmlBuilder<ParentMessage>) =>
  (entry: Entry, isSelected: boolean): Html => {
    const {
      itemContent = defaultItemContent,
      customLabel = DEFAULT_CUSTOM_LABEL,
      customOptionLabel = defaultCustomOptionLabel,
    } = config;
    const indicator = (indicatorContent: ReadonlyArray<Child>): Html =>
      h.span([h.Class('col-start-1 flex')], indicatorContent);
    const label = (children: ReadonlyArray<Child>, className = labelClassName): Html =>
      h.div([h.Class(cn('col-start-2 flex min-w-0 items-center gap-row-gap', className))], children);

    return h.span(
      [h.Class('contents')],
      Entry.match(entry, {
        Item: ({ value, label: optionLabel, description }) => [
          indicator(isSelected ? [icon('check')] : []),
          label(itemContent({ value, label: optionLabel, description })),
        ],
        CustomValue: ({ text }) => [
          indicator(isSelected ? [icon('check')] : []),
          label([
            h.span([h.Class('truncate')], [text]),
            h.span(
              [
                h.Class(
                  'ms-auto shrink-0 text-caption text-muted-foreground group-data-active/combobox-item:text-foreground',
                ),
              ],
              [customLabel],
            ),
          ]),
        ],
        Proposal: ({ text }) => [
          indicator([icon('plus', { className: 'text-muted-foreground' })]),
          label(
            [
              h.span(
                [h.Class('flex min-w-0 whitespace-pre')],
                customOptionLabel(h.span([h.Class('truncate')], [text])),
              ),
            ],
            '',
          ),
        ],
      }),
    );
  };

const itemConfigFor = <ParentMessage>(
  config: SharedViewConfig<ParentMessage>,
  rowsByKey: EntriesByKey,
  h: HtmlBuilder<ParentMessage>,
) => {
  const { emptyText = '' } = config;
  const entryContent = entryContentFor(config, 'wrap-anywhere', h);
  return (key: string, { isSelected }: Readonly<{ isSelected: boolean }>) =>
    Option.match(entryAt(rowsByKey, key), {
      onNone: () => ({
        className: cn(itemClassName, 'grid-cols-1'),
        content: h.div([h.DataAttribute('slot', 'combobox-empty'), h.Class(emptyClassName)], [emptyText]),
      }),
      onSome: (entry) => ({ className: itemClassName, content: entryContent(entry, isSelected) }),
    });
};

const openedMessage = Message.GotComboboxMessage({
  message: ComboboxPrimitive.Message.Opened({ maybeActiveItemIndex: Option.none() }),
});

const isPanelShown = (model: Model): boolean => model.isOpen || model.animation.transitionState !== 'Idle';

const rowsWithEmpty = (rows: ReadonlyArray<Entry>, isOpen: boolean): ReadonlyArray<string> =>
  Array.match(rows, {
    onEmpty: () => (isOpen ? [EMPTY_KEY] : []),
    onNonEmpty: Array.map(entryKey),
  });

const inputClassName =
  'h-full w-full min-w-0 flex-1 bg-transparent px-[calc(var(--spacing-field-pad)-1px)] text-control outline-none placeholder:text-faint-foreground data-disabled:cursor-not-allowed max-md:text-[1rem]';

const inputGroupClassName = cn(
  Input.inputSurfaceVariants({ scope: 'group' }),
  'group/input-group relative flex h-control w-full min-w-0 items-center pr-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)]',
  'has-[[data-slot=input-group-control][data-disabled]]:pointer-events-none has-[[data-slot=input-group-control][data-disabled]]:opacity-64 has-[[data-slot=input-group-control][data-disabled]]:shadow-field-flat has-[[data-slot=input-group-control][data-disabled]]:before:shadow-none',
);

type ClearButtonConfig<ParentMessage> = Readonly<{
  clearLabel: string;
  isDisabled: boolean;
  isReadOnly: boolean;
  onClear: ParentMessage;
}>;

const clearButton = <ParentMessage>(
  { clearLabel, isDisabled, isReadOnly, onClear }: ClearButtonConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.DataAttribute('slot', 'combobox-clear'),
      h.AriaLabel(clearLabel),
      ...(isDisabled ? [h.Disabled(true), h.DataAttribute('disabled', '')] : []),
      ...(isDisabled || isReadOnly ? [] : [h.OnClick(onClear)]),
      h.Class(
        cn(
          fieldButtonClassName,
          'absolute top-1/2 right-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] -translate-y-1/2',
        ),
      ),
    ],
    [icon('x', { className: 'pointer-events-none' })],
  );

export type ViewConfig<ParentMessage> = SharedViewConfig<ParentMessage> &
  Readonly<{
    maybeValue: Option.Option<string>;
    clearLabel?: string | undefined;
    openLabel?: string | undefined;
  }>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    options,
    maybeValue,
    allowCustom = false,
    customLabel = DEFAULT_CUSTOM_LABEL,
    placeholder,
    ariaLabel,
    isInvalid = false,
    isReadOnly = false,
    isDisabled = false,
    clearLabel = DEFAULT_CLEAR_LABEL,
    openLabel = DEFAULT_OPEN_LABEL,
    className,
  } = config;

  const values = Option.toArray(maybeValue);
  const rows = isPanelShown(model)
    ? entries({ options, values, query: model.inputValue, isMultiple: false, allowCustom })
    : [];
  const rowsByKey = entriesByKey(rows);
  const restingInputValue = Option.match(maybeValue, { onNone: () => '', onSome: (value) => labelOf(options, value) });
  const hasValue = Option.isSome(maybeValue);
  const isCustomNoteShown = Option.exists(maybeValue, (value) => allowCustom && isCustomValue(options, value));
  const customNoteId = `${model.id}-custom-note`;
  const toComboboxParentMessage = (message: ComboboxPrimitive.Message): ParentMessage =>
    toParentMessage(toGotComboboxMessage(message));

  const comboboxView = h.submodel({
    slotId: model.id,
    model,
    view: SingleBundle.view,
    viewInputs: {
      items: rowsWithEmpty(rows, model.isOpen),
      maybeSelectedValue: Option.map(maybeValue, (value) =>
        isCustomValue(options, value) && allowCustom ? `CustomValue:${value}` : `Item:${value}`,
      ),
      restingInputValue,
      itemToValue: (key) => key,
      itemToDisplayText: (key) => displayTextAt(rowsByKey, key),
      isItemDisabled: (key) => key === EMPTY_KEY,
      itemToConfig: itemConfigFor(config, rowsByKey, h),
      className: 'relative',
      inputWrapperClassName: inputGroupClassName,
      inputWrapperAttributes: childAttributes([h.DataAttribute('slot', 'input-group')]),
      inputClassName,
      inputAttributes: childAttributes([
        h.DataAttribute('slot', 'input-group-control'),
        ...(isCustomNoteShown ? [h.AriaDescribedBy(customNoteId)] : []),
        ...(isDisabled ? [] : [h.OnClick(toParentMessage(openedMessage))]),
      ]),
      ...(placeholder === undefined ? {} : { inputPlaceholder: placeholder }),
      buttonContent: icon('selector', { className: 'pointer-events-none' }),
      buttonClassName: cn(fieldButtonClassName, hasValue && 'invisible'),
      buttonAttributes: childAttributes([h.AriaLabel(openLabel), h.DataAttribute('slot', 'input-group-button')]),
      itemsClassName: contentClassName,
      itemsAttributes: childAttributes([
        h.DataAttribute('slot', 'combobox-content'),
        h.DataAttribute('surface', 'popup'),
      ]),
      anchor: { placement: 'bottom-start', gap: 4, padding: 8 },
      isDisabled,
      isReadOnly,
      isInvalid,
      ...(ariaLabel === undefined ? {} : { ariaLabel }),
    },
    toParentMessage: toComboboxParentMessage,
  });

  return h.div(
    [h.DataAttribute('slot', 'combobox'), h.Class(cn('relative w-auto', className))],
    [
      comboboxView,
      ...(hasValue
        ? [clearButton({ clearLabel, isDisabled, isReadOnly, onClear: toParentMessage(Message.ClickedClear()) }, h)]
        : []),
      ...(isCustomNoteShown ? [h.span([h.Id(customNoteId), h.Class('sr-only')], [customLabel])] : []),
    ],
  );
};

export type MultipleViewConfig<ParentMessage> = SharedViewConfig<ParentMessage> &
  Readonly<{
    values: ReadonlyArray<string>;
    onRemove: (value: string) => ParentMessage;
    removeLabel?: string | undefined;
  }>;

export const multiple = <ParentMessage>(
  config: MultipleViewConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const {
    model,
    toParentMessage,
    options,
    values,
    onRemove,
    allowCustom = false,
    placeholder,
    ariaLabel,
    isInvalid = false,
    isReadOnly = false,
    isDisabled = false,
    removeLabel = DEFAULT_REMOVE_LABEL,
    className,
  } = config;

  const rows = isPanelShown(model)
    ? entries({ options, values, query: model.inputValue, isMultiple: true, allowCustom })
    : [];
  const rowsByKey = entriesByKey(rows);

  const chip = (value: string): Html =>
    h.keyed('div')(
      value,
      [
        h.DataAttribute('slot', 'combobox-chip'),
        ...(isDisabled ? [h.AriaDisabled(true)] : []),
        h.Class(
          'flex h-control-xs w-fit items-center rounded-inner bg-foreground/4 pl-(--field-chip-pad-x) text-caption font-medium whitespace-nowrap text-foreground [--outer-inset:calc((var(--spacing-control)-var(--spacing-control-xs))/2)] aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed dark:bg-foreground/8',
        ),
      ],
      [
        labelOf(options, value),
        h.button(
          [
            h.Type('button'),
            h.Tabindex(-1),
            h.AriaLabel(removeLabel),
            h.DataAttribute('slot', 'combobox-chip-remove'),
            ...(isDisabled || isReadOnly ? [] : [h.OnClick(onRemove(value))]),
            h.Class(
              'flex h-full shrink-0 cursor-pointer items-center px-(--field-chip-pad-x) text-faint-foreground outline-none hover:text-foreground focus-visible:text-foreground',
            ),
          ],
          [icon('x', { className: 'pointer-events-none size-icon-sm' })],
        ),
      ],
    );

  const comboboxView = h.submodel({
    slotId: model.id,
    model,
    view: MultiBundle.view,
    viewInputs: {
      items: rowsWithEmpty(rows, model.isOpen),
      selectedValues: Array.map(values, (value) =>
        isCustomValue(options, value) && allowCustom ? `CustomValue:${value}` : `Item:${value}`,
      ),
      restingInputValue: '',
      itemToValue: (key) => key,
      itemToDisplayText: (key) => displayTextAt(rowsByKey, key),
      isItemDisabled: (key) => key === EMPTY_KEY,
      itemToConfig: itemConfigFor(config, rowsByKey, h),
      className: 'relative min-w-16 flex-1',
      inputWrapperClassName: 'flex h-control-xs',
      inputClassName: cn(
        'h-control-xs min-w-16 flex-1 bg-transparent pl-[calc(var(--spacing-field-pad)-calc((var(--spacing-control)-var(--spacing-control-xs))/2))] outline-none max-md:text-[1rem] placeholder:text-faint-foreground',
        '[[data-slot=combobox-chip]+[data-slot=combobox]_&]:pl-tight',
      ),
      inputAttributes: childAttributes([
        h.DataAttribute('slot', 'combobox-chip-input'),
        ...(isDisabled ? [] : [h.OnClick(toParentMessage(openedMessage))]),
      ]),
      ...(placeholder === undefined ? {} : { inputPlaceholder: placeholder }),
      itemsClassName: contentClassName,
      itemsAttributes: childAttributes([
        h.DataAttribute('slot', 'combobox-content'),
        h.DataAttribute('surface', 'popup'),
      ]),
      anchor: { placement: 'bottom-start', gap: 4, padding: 8 },
      isDisabled,
      isReadOnly,
      isInvalid,
      ...(ariaLabel === undefined ? {} : { ariaLabel }),
    },
    toParentMessage: (message: ComboboxPrimitive.Message) => toParentMessage(toGotComboboxMessage(message)),
  });

  return h.div(
    [
      h.DataAttribute('slot', 'combobox-chips'),
      ...(isInvalid ? [h.AriaInvalid(true)] : []),
      h.Class(
        cn(
          Input.inputSurfaceVariants({ scope: 'within' }),
          'flex min-h-control flex-wrap items-center gap-tight p-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] text-body [--field-radius:var(--radius-area)]',
          'has-data-disabled:pointer-events-none has-data-disabled:cursor-not-allowed has-data-disabled:opacity-64',
          className,
        ),
      ),
    ],
    [...Array.map(values, chip), h.div([h.DataAttribute('slot', 'combobox'), h.Class('contents')], [comboboxView])],
  );
};

export const toggledValues = (values: ReadonlyArray<string>, value: string): ReadonlyArray<string> =>
  Array.contains(values, value) ? Array.filter(values, (current) => current !== value) : Array.append(values, value);

const DEFAULT_ROW_HEIGHT = 36;
const DEFAULT_PAGE_ROW_COUNT = 8;
const LIST_OVERSCAN = 10;

const ListMove = Schema.Literals(['Next', 'Previous', 'First', 'Last', 'NextPage', 'PreviousPage']);
type ListMove = typeof ListMove.Type;

export const VirtualizedModel = Schema.Struct({
  combobox: Model,
  firstVisibleIndex: Schema.Number,
  pageRowCount: Schema.Number,
});
export type VirtualizedModel = typeof VirtualizedModel.Type;

export const VirtualizedMessage = defineMessageUnion({
  ...messageCases,
  PressedNavigationKey: { move: ListMove, rowCount: Schema.Number },
  PressedEnterKey: {},
  ObservedListScroll: { firstVisibleIndex: Schema.Number, pageRowCount: Schema.Number },
  CompletedResetListScroll: {},
});
export type VirtualizedMessage = typeof VirtualizedMessage.Type;

export const initVirtualized = (config: InitConfig): VirtualizedModel => ({
  combobox: init(config),
  firstVisibleIndex: 0,
  pageRowCount: DEFAULT_PAGE_ROW_COUNT,
});

export const listboxId = (id: string): string => `${id}-listbox`;
const listScrollId = (id: string): string => `${id}-list-scroll`;
const optionId = (id: string, index: number): string => `${id}-item-${index}`;

type ListGeometry = Readonly<{ firstVisibleIndex: number; pageRowCount: number }>;

const listGeometry = (element: HTMLElement): ListGeometry => {
  const rowHeight = pipe(
    Option.fromNullishOr(element.querySelector('[role=option]')),
    Option.filter((row) => row instanceof HTMLElement),
    Option.map((row) => row.offsetHeight),
    Option.filter((height) => height > 0),
    Option.getOrElse(() => DEFAULT_ROW_HEIGHT),
  );
  return {
    firstVisibleIndex: Math.floor(element.scrollTop / rowHeight),
    pageRowCount: Math.max(1, Math.floor(element.clientHeight / rowHeight)),
  };
};

const isSameGeometry = (first: ListGeometry, second: ListGeometry): boolean =>
  first.firstVisibleIndex === second.firstVisibleIndex && first.pageRowCount === second.pageRowCount;

type ObservedListScroll = typeof VirtualizedMessage.ObservedListScroll.Type;

const observeListScroll = (element: Element): Stream.Stream<ObservedListScroll> =>
  Stream.callback<ObservedListScroll>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        if (!(element instanceof HTMLElement)) {
          return () => undefined;
        }

        let lastGeometry: ListGeometry = { firstVisibleIndex: 0, pageRowCount: DEFAULT_PAGE_ROW_COUNT };
        const emitChangedGeometry = () => {
          const geometry = listGeometry(element);
          if (!isSameGeometry(geometry, lastGeometry)) {
            lastGeometry = geometry;
            Queue.offerUnsafe(queue, VirtualizedMessage.ObservedListScroll(geometry));
          }
        };

        emitChangedGeometry();
        element.addEventListener('scroll', emitChangedGeometry, { passive: true });
        const resizeObserver = new ResizeObserver(emitChangedGeometry);
        resizeObserver.observe(element);

        return () => {
          resizeObserver.disconnect();
          element.removeEventListener('scroll', emitChangedGeometry);
        };
      }),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.flatMap(() => Effect.never)),
  );

export const ObserveListScroll = Mount.defineStream('ObserveListScroll', {
  messages: [VirtualizedMessage.ObservedListScroll],
  execute: ({ element }) => observeListScroll(element),
});

const ResetListScroll = Command.define('ResetListScroll', {
  args: { id: Schema.String },
  messages: [VirtualizedMessage.CompletedResetListScroll],
  execute: ({ id }) =>
    Effect.gen(function* () {
      yield* Render.afterCommit;
      const maybeElement = Option.fromNullishOr(document.getElementById(listScrollId(id)));
      if (Option.isSome(maybeElement)) {
        maybeElement.value.scrollTop = 0;
      }
      return VirtualizedMessage.CompletedResetListScroll();
    }),
});

type VirtualizedUpdateReturn = Update.ReturnWithOutMessage<VirtualizedModel, VirtualizedMessage, OutMessage>;

const toVirtualizedComboboxMessage = (message: ComboboxPrimitive.Message): VirtualizedMessage =>
  VirtualizedMessage.GotComboboxMessage({ message });

const withComboboxUpdate = (model: VirtualizedModel, comboboxUpdate: UpdateReturn): VirtualizedUpdateReturn => {
  const { combobox } = model;
  const nextCombobox = comboboxUpdate.model;
  const didOpen = !combobox.isOpen && nextCombobox.isOpen;
  const isListReset = didOpen || (nextCombobox.isOpen && nextCombobox.inputValue !== combobox.inputValue);
  const maybeScrollToActive = pipe(
    nextCombobox.maybeActiveItemIndex,
    Option.filter(() => didOpen),
    Option.map((index) =>
      Command.mapMessage(ComboboxPrimitive.ScrollIntoView({ id: combobox.id, index }), toVirtualizedComboboxMessage),
    ),
  );

  return {
    model: modifyFields(model, {
      combobox: () => nextCombobox,
      firstVisibleIndex: (firstVisibleIndex) => (isListReset ? 0 : firstVisibleIndex),
      pageRowCount: (pageRowCount) => (didOpen ? DEFAULT_PAGE_ROW_COUNT : pageRowCount),
    }),
    commands: [
      ...(comboboxUpdate.commands ?? []),
      ...(isListReset ? [ResetListScroll({ id: combobox.id })] : []),
      ...Option.toArray(maybeScrollToActive),
    ],
    ...(comboboxUpdate.outMessage === undefined ? {} : { outMessage: comboboxUpdate.outMessage }),
  };
};

const withComboboxMessage = (model: VirtualizedModel, message: ComboboxPrimitive.Message): VirtualizedUpdateReturn =>
  withComboboxUpdate(model, update(model.combobox, Message.GotComboboxMessage({ message })));

const movedIndex = (
  move: ListMove,
  maybeActiveIndex: Option.Option<number>,
  rowCount: number,
  pageRowCount: number,
): number => {
  const lastIndex = rowCount - 1;
  return Match.value(move).pipe(
    Match.withReturnType<number>(),
    Match.when('Next', () =>
      Option.match(maybeActiveIndex, { onNone: () => 0, onSome: (index) => (index >= lastIndex ? 0 : index + 1) }),
    ),
    Match.when('Previous', () =>
      Option.match(maybeActiveIndex, {
        onNone: () => lastIndex,
        onSome: (index) => (index <= 0 ? lastIndex : index - 1),
      }),
    ),
    Match.when('First', () => 0),
    Match.when('Last', () => lastIndex),
    Match.when('NextPage', () => Math.min(lastIndex, Option.getOrElse(maybeActiveIndex, () => -1) + pageRowCount)),
    Match.when('PreviousPage', () => Math.max(0, Option.getOrElse(maybeActiveIndex, () => rowCount) - pageRowCount)),
    Match.exhaustive,
  );
};

const pressedNavigationKey = (model: VirtualizedModel, move: ListMove, rowCount: number): VirtualizedUpdateReturn => {
  const { combobox } = model;
  const maybeActiveIndex = Option.filter(combobox.maybeActiveItemIndex, (index) => index < rowCount);

  if (rowCount === 0) {
    return withComboboxMessage(model, ComboboxPrimitive.Message.SuppressedEmptyItemNavigation());
  } else if (combobox.isOpen) {
    return withComboboxMessage(
      model,
      ComboboxPrimitive.Message.ActivatedItem({
        index: movedIndex(move, maybeActiveIndex, rowCount, model.pageRowCount),
        activationTrigger: 'Keyboard',
        maybeImmediateSelection: Option.none(),
      }),
    );
  } else {
    return withComboboxMessage(
      model,
      ComboboxPrimitive.Message.Opened({ maybeActiveItemIndex: Option.some(move === 'Previous' ? rowCount - 1 : 0) }),
    );
  }
};

export const updateVirtualized = (model: VirtualizedModel, message: VirtualizedMessage) =>
  VirtualizedMessage.match<VirtualizedUpdateReturn>(message, {
    GotComboboxMessage: (gotComboboxMessage) => withComboboxUpdate(model, update(model.combobox, gotComboboxMessage)),
    ClickedClear: (clickedClear) => withComboboxUpdate(model, update(model.combobox, clickedClear)),
    CompletedFocusInput: () => ({ model }),
    PressedNavigationKey: ({ move, rowCount }) => pressedNavigationKey(model, move, rowCount),
    PressedEnterKey: () =>
      Option.match(
        Option.filter(model.combobox.maybeActiveItemIndex, () => model.combobox.isOpen),
        {
          onNone: () => ({ model }),
          onSome: (index) => withComboboxMessage(model, ComboboxPrimitive.Message.RequestedItemClick({ index })),
        },
      ),
    ObservedListScroll: (geometry) =>
      isSameGeometry(model, geometry)
        ? { model }
        : {
            model: modifyFields(model, {
              firstVisibleIndex: () => geometry.firstVisibleIndex,
              pageRowCount: () => geometry.pageRowCount,
            }),
          },
    CompletedResetListScroll: () => ({ model }),
  });

const indexRange = (start: number, end: number, rowCount: number): ReadonlyArray<number> => {
  const first = Math.max(0, start);
  const last = Math.min(rowCount - 1, end);
  return first > last ? [] : Array.range(first, last);
};

const mountedIndices = (
  rowCount: number,
  { firstVisibleIndex, pageRowCount }: ListGeometry,
  maybeActiveIndex: Option.Option<number>,
): ReadonlyArray<number> => {
  const scrolled = indexRange(
    firstVisibleIndex - LIST_OVERSCAN,
    firstVisibleIndex + pageRowCount + LIST_OVERSCAN,
    rowCount,
  );
  const aroundActive = Option.match(maybeActiveIndex, {
    onNone: () => [],
    onSome: (index) => indexRange(index - pageRowCount - 1, index + pageRowCount + 1, rowCount),
  });
  return Array.sort(Array.union(scrolled, aroundActive), Number.Order);
};

const transitionAttributes = <ParentMessage>(
  transitionState: Model['animation']['transitionState'],
  h: HtmlBuilder<ParentMessage>,
) =>
  Match.value(transitionState).pipe(
    Match.when('EnterStart', () => [
      h.DataAttribute('closed', ''),
      h.DataAttribute('enter', ''),
      h.DataAttribute('transition', ''),
    ]),
    Match.when('EnterAnimating', () => [h.DataAttribute('enter', ''), h.DataAttribute('transition', '')]),
    Match.when('LeaveStart', () => [h.DataAttribute('leave', ''), h.DataAttribute('transition', '')]),
    Match.when('LeaveAnimating', () => [
      h.DataAttribute('closed', ''),
      h.DataAttribute('leave', ''),
      h.DataAttribute('transition', ''),
    ]),
    Match.orElse(() => []),
  );

const virtualizedContentClassName = cn(contentClassName, 'flex flex-col overflow-hidden p-0');

const virtualizedEmptyClassName =
  'text-center text-body text-muted-foreground not-empty:px-menu-item-pad not-empty:py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)]';

const NAVIGATION_KEYS: Readonly<Record<string, ListMove>> = {
  ArrowDown: 'Next',
  ArrowUp: 'Previous',
  Home: 'First',
  End: 'Last',
  PageDown: 'NextPage',
  PageUp: 'PreviousPage',
};

const OPENING_MOVES: ReadonlyArray<ListMove> = ['Next', 'Previous'];

export type VirtualizedViewConfig<ParentMessage> = Omit<ViewConfig<ParentMessage>, 'model' | 'toParentMessage'> &
  Readonly<{
    model: VirtualizedModel;
    toParentMessage: (message: VirtualizedMessage) => ParentMessage;
  }>;

export const virtualized = <ParentMessage>(
  config: VirtualizedViewConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const {
    model,
    toParentMessage,
    options,
    maybeValue,
    allowCustom = false,
    customLabel = DEFAULT_CUSTOM_LABEL,
    emptyText = '',
    placeholder,
    ariaLabel,
    isInvalid = false,
    isReadOnly = false,
    isDisabled = false,
    clearLabel = DEFAULT_CLEAR_LABEL,
    openLabel = DEFAULT_OPEN_LABEL,
    className,
  } = config;
  const { combobox } = model;
  const { id, isOpen } = combobox;
  const { transitionState } = combobox.animation;
  const toComboboxParentMessage = (message: ComboboxPrimitive.Message): ParentMessage =>
    toParentMessage(toVirtualizedComboboxMessage(message));

  const values = Option.toArray(maybeValue);
  const entriesFor = (query: string): ReadonlyArray<Entry> =>
    cachedEntries({ options, values, query, isMultiple: false, allowCustom });
  const isShown = isPanelShown(combobox);
  const rows = isShown ? entriesFor(combobox.inputValue) : [];
  const rowCount = rows.length;
  const isEmpty = Array.isReadonlyArrayEmpty(rows);
  const isLeaving = transitionState === 'LeaveStart' || transitionState === 'LeaveAnimating';
  const restingInputValue = Option.match(maybeValue, { onNone: () => '', onSome: (value) => labelOf(options, value) });
  const maybeSelectedKey = Option.map(maybeValue, (value) =>
    isCustomValue(options, value) && allowCustom ? `CustomValue:${value}` : `Item:${value}`,
  );
  const hasValue = Option.isSome(maybeValue);
  const isCustomNoteShown = Option.exists(maybeValue, (value) => allowCustom && isCustomValue(options, value));
  const customNoteId = `${id}-custom-note`;
  const maybeActiveIndex = Option.filter(combobox.maybeActiveItemIndex, (index) => index < rowCount);
  const entryContent = entryContentFor(config, 'truncate', h);
  const openingActiveIndex = (): Option.Option<number> =>
    Option.flatMap(maybeSelectedKey, (selectedKey) =>
      Array.findFirstIndex(entriesFor(combobox.inputValue), (entry) => entryKey(entry) === selectedKey),
    );

  const navigationMessage = (move: ListMove): Option.Option<ParentMessage> => {
    if (isOpen) {
      return Option.some(toParentMessage(VirtualizedMessage.PressedNavigationKey({ move, rowCount })));
    } else if (Array.contains(OPENING_MOVES, move)) {
      return Option.some(
        toParentMessage(
          VirtualizedMessage.PressedNavigationKey({ move, rowCount: entriesFor(combobox.inputValue).length }),
        ),
      );
    } else {
      return Option.none();
    }
  };

  const handleInputKeyDown = (key: string): Option.Option<ParentMessage> =>
    Option.match(Option.fromNullishOr(NAVIGATION_KEYS[key]), {
      onSome: navigationMessage,
      onNone: () =>
        Match.value(key).pipe(
          Match.withReturnType<Option.Option<ParentMessage>>(),
          Match.when('Enter', () =>
            Option.liftPredicate(
              isReadOnly
                ? toComboboxParentMessage(ComboboxPrimitive.Message.SuppressedItemCommit())
                : toParentMessage(VirtualizedMessage.PressedEnterKey()),
              () => isOpen,
            ),
          ),
          Match.when('Escape', () =>
            Option.liftPredicate(
              toComboboxParentMessage(
                ComboboxPrimitive.Message.Closed({ restingInputValue, isClearable: !isReadOnly }),
              ),
              () => isOpen,
            ),
          ),
          Match.orElse(() => Option.none()),
        ),
    });

  const pointerMessage = (pointerType: string, message: ComboboxPrimitive.Message): Option.Option<ParentMessage> =>
    pointerType === 'touch' ? Option.none() : Option.some(toComboboxParentMessage(message));

  const row = (entry: Entry, index: number): Html => {
    const key = entryKey(entry);
    const isActive = Option.contains(maybeActiveIndex, index);
    const isSelected = Option.contains(maybeSelectedKey, key);
    const isClickable = !isLeaving && !isReadOnly;
    return h.keyed('div')(
      key,
      [
        h.Id(optionId(id, index)),
        h.Role('option'),
        h.AriaSelected(isSelected),
        h.AriaSetsize(rowCount),
        h.AriaPosinset(index + 1),
        h.DataAttribute('slot', 'combobox-item'),
        h.DataAttribute('index', globalThis.String(index)),
        ...(isActive ? [h.DataAttribute('active', '')] : []),
        ...(isSelected ? [h.DataAttribute('selected', '')] : []),
        ...(isReadOnly ? [h.DataAttribute('readonly', '')] : []),
        ...(isClickable
          ? [
              h.OnClick(
                toComboboxParentMessage(
                  ComboboxPrimitive.Message.SelectedItem({
                    item: key,
                    displayText: entryLabel(entry),
                    wasSelected: isSelected,
                  }),
                ),
              ),
            ]
          : []),
        ...(isLeaving
          ? []
          : [
              ...(isActive
                ? []
                : [
                    h.OnPointerMove((screenX, screenY, pointerType) =>
                      pointerMessage(
                        pointerType,
                        ComboboxPrimitive.Message.MovedPointerOverItem({ index, screenX, screenY }),
                      ),
                    ),
                  ]),
              h.OnPointerLeave((pointerType) =>
                pointerMessage(pointerType, ComboboxPrimitive.Message.DeactivatedItem()),
              ),
            ]),
        h.Style({ position: 'absolute', top: `calc(${index} * var(--spacing-menu-item))`, left: '0', width: '100%' }),
        h.Class(itemClassName),
      ],
      [entryContent(entry, isSelected)],
    );
  };

  const list = h.div(
    [
      h.Id(listScrollId(id)),
      h.Role('presentation'),
      h.OnMount(Mount.mapMessage(ObserveListScroll(), toParentMessage)),
      h.Class('no-scrollbar max-h-72 min-h-0 scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain'),
    ],
    [
      h.div(
        [
          h.Role('presentation'),
          h.Class('relative w-full'),
          h.Style({ height: `calc(${rowCount} * var(--spacing-menu-item))` }),
        ],
        Array.getSomes(
          Array.map(mountedIndices(rowCount, model, maybeActiveIndex), (index) =>
            Option.map(Array.get(rows, index), (entry) => row(entry, index)),
          ),
        ),
      ),
    ],
  );

  const panel = h.keyed('div')(
    `${id}-items-container`,
    [
      h.Id(`${id}-items`),
      h.Role('presentation'),
      h.Tabindex(-1),
      h.DataAttribute('slot', 'combobox-content'),
      h.DataAttribute('surface', 'popup'),
      h.Style({ position: 'absolute', margin: '0', visibility: 'hidden' }),
      h.OnMount(
        Mount.mapMessage(
          ComboboxPrimitive.AnchorCombobox({
            buttonId: `${id}-input-wrapper`,
            anchor: { placement: 'bottom-start', gap: 4, padding: 8 },
          }),
          toComboboxParentMessage,
        ),
      ),
      ...transitionAttributes(transitionState, h),
      h.Class(virtualizedContentClassName),
    ],
    [
      h.div(
        [
          h.Role('status'),
          h.Attribute('aria-live', 'polite'),
          h.Attribute('aria-atomic', 'true'),
          h.DataAttribute('slot', 'combobox-empty'),
          h.Class(virtualizedEmptyClassName),
        ],
        isEmpty && isOpen ? [emptyText] : [],
      ),
      h.div(
        [
          h.Id(listboxId(id)),
          h.Role('listbox'),
          h.AriaLabelledBy(inputId(id)),
          h.Tabindex(-1),
          h.DataAttribute('slot', 'combobox-list'),
          ...(isEmpty ? [h.DataAttribute('empty', '')] : []),
          ...(isReadOnly ? [h.AriaReadonly(true), h.DataAttribute('readonly', '')] : []),
          h.Class('flex min-h-0 flex-col overflow-hidden p-popup-inset data-empty:p-0'),
        ],
        isEmpty ? [] : [list],
      ),
    ],
  );

  const input = h.input([
    h.Id(inputId(id)),
    h.Role('combobox'),
    h.AriaExpanded(isShown),
    ...(isShown ? [h.AriaControls(listboxId(id))] : []),
    h.Attribute('aria-autocomplete', 'list'),
    h.Attribute('aria-haspopup', 'listbox'),
    ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
    h.Autocomplete('off'),
    h.Value(combobox.inputValue),
    ...(isShown
      ? Option.match(maybeActiveIndex, {
          onNone: () => [],
          onSome: (index) => [h.AriaActiveDescendant(optionId(id, index))],
        })
      : []),
    ...(placeholder === undefined ? [] : [h.Placeholder(placeholder)]),
    ...(isDisabled
      ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
      : [
          ...(isReadOnly
            ? []
            : [h.OnInput((value) => toComboboxParentMessage(ComboboxPrimitive.Message.UpdatedInputValue({ value })))]),
          h.OnKeyDownPreventDefault(handleInputKeyDown),
          h.OnBlur(
            toComboboxParentMessage(
              ComboboxPrimitive.Message.BlurredInput({ restingInputValue, isClearable: !isReadOnly }),
            ),
          ),
          h.OnClick(
            toComboboxParentMessage(ComboboxPrimitive.Message.Opened({ maybeActiveItemIndex: openingActiveIndex() })),
          ),
        ]),
    ...(isReadOnly ? [h.Readonly(true), h.AriaReadonly(true), h.DataAttribute('readonly', '')] : []),
    ...(isInvalid ? [h.AriaInvalid(true), h.DataAttribute('invalid', '')] : []),
    ...(isShown ? [h.DataAttribute('open', '')] : []),
    h.DataAttribute('slot', 'input-group-control'),
    ...(isCustomNoteShown ? [h.AriaDescribedBy(customNoteId)] : []),
    h.Class(inputClassName),
  ]);

  const toggleButton = h.keyed('button')(
    `${id}-button`,
    [
      h.Id(`${id}-button`),
      h.Type('button'),
      h.Tabindex(-1),
      ...(isShown ? [h.AriaControls(listboxId(id))] : []),
      h.AriaExpanded(isShown),
      h.Attribute('aria-haspopup', 'listbox'),
      ...(isDisabled
        ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
        : [
            h.OnClick(
              toComboboxParentMessage(
                ComboboxPrimitive.Message.PressedToggleButton({ restingInputValue, isClearable: !isReadOnly }),
              ),
            ),
          ]),
      ...(isReadOnly ? [h.DataAttribute('readonly', '')] : []),
      h.OnMount(Mount.mapMessage(ComboboxPrimitive.AttachComboboxPreventBlur(), toComboboxParentMessage)),
      h.AriaLabel(openLabel),
      h.DataAttribute('slot', 'input-group-button'),
      h.Class(cn(fieldButtonClassName, hasValue && 'invisible')),
    ],
    [icon('selector', { className: 'pointer-events-none' })],
  );

  return h.div(
    [h.DataAttribute('slot', 'combobox'), h.Class(cn('relative w-auto', className))],
    [
      h.div(
        [
          h.Class('relative'),
          ...(isShown ? [h.DataAttribute('open', '')] : []),
          ...(isDisabled ? [h.DataAttribute('disabled', '')] : []),
          ...(isReadOnly ? [h.DataAttribute('readonly', '')] : []),
          ...(isInvalid ? [h.DataAttribute('invalid', '')] : []),
        ],
        [
          h.div(
            [h.Id(`${id}-input-wrapper`), h.DataAttribute('slot', 'input-group'), h.Class(inputGroupClassName)],
            [input, toggleButton],
          ),
          ...(isShown ? [panel] : []),
        ],
      ),
      ...(hasValue
        ? [
            clearButton(
              { clearLabel, isDisabled, isReadOnly, onClear: toParentMessage(VirtualizedMessage.ClickedClear()) },
              h,
            ),
          ]
        : []),
      ...(isCustomNoteShown ? [h.span([h.Id(customNoteId), h.Class('sr-only')], [customLabel])] : []),
    ],
  );
};

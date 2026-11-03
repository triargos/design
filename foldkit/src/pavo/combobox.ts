import { Combobox as ComboboxPrimitive } from '@foldkit/ui';
import { Array, Effect, Number, Option, Order, Schema, String, pipe } from 'effect';
import { Command, type Update } from 'foldkit';
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

export const Message = defineMessageUnion({
  GotComboboxMessage: { message: ComboboxPrimitive.Message },
  ClickedClear: {},
  CompletedFocusInput: {},
});
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
): UpdateReturn => ({
  model: comboboxUpdate.model,
  commands: Command.mapMessages(comboboxUpdate.commands ?? [], toGotComboboxMessage),
  ...pipe(
    Option.fromNullishOr(comboboxUpdate.outMessage),
    Option.match({
      onNone: () => ({}),
      onSome: (outMessage) => ({
        outMessage: ComboboxPrimitive.OutMessage.match<OutMessage, ComboboxPrimitive.OutMessage<string>>(outMessage, {
          Selected: ({ value }) => OutMessage.Selected({ value: valueOfKey(value) }),
          ClearedSelection: () => OutMessage.Cleared(),
        }),
      }),
    }),
  ),
});

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

export const reflectInputValue = (model: Model, inputValue: string): Model =>
  modifyFields(model, { inputValue: () => inputValue });

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

const itemConfigFor = <ParentMessage>(
  config: SharedViewConfig<ParentMessage>,
  rowsByKey: EntriesByKey,
  h: HtmlBuilder<ParentMessage>,
) => {
  const {
    options,
    itemContent = defaultItemContent,
    emptyText = '',
    customLabel = DEFAULT_CUSTOM_LABEL,
    customOptionLabel = defaultCustomOptionLabel,
  } = config;
  const optionsByValue: ReadonlyMap<string, SelectOption> = new Map(
    Array.map(options, (option): readonly [string, SelectOption] => [option.value, option]),
  );
  return (key: string, { isSelected }: Readonly<{ isSelected: boolean }>) => {
    const maybeEntry = entryAt(rowsByKey, key);
    const indicator = (indicatorContent: ReadonlyArray<Child>): Html =>
      h.span([h.Class('col-start-1 flex')], indicatorContent);
    const label = (children: ReadonlyArray<Child>, className = 'wrap-anywhere'): Html =>
      h.div([h.Class(cn('col-start-2 flex min-w-0 items-center gap-row-gap', className))], children);

    return Option.match(maybeEntry, {
      onNone: () => ({
        className: cn(itemClassName, 'grid-cols-1'),
        content: h.div([h.DataAttribute('slot', 'combobox-empty'), h.Class(emptyClassName)], [emptyText]),
      }),
      onSome: (entry) => ({
        className: itemClassName,
        content: h.span(
          [h.Class('contents')],
          Entry.match(entry, {
            Item: ({ value }) => [
              indicator(isSelected ? [icon('check')] : []),
              label(
                Option.match(Option.fromNullishOr(optionsByValue.get(value)), {
                  onNone: () => [value],
                  onSome: itemContent,
                }),
              ),
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
        ),
      }),
    });
  };
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
      inputWrapperClassName: cn(
        Input.inputSurfaceVariants({ scope: 'group' }),
        'group/input-group relative flex h-control w-full min-w-0 items-center pr-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)]',
        'has-[[data-slot=input-group-control][data-disabled]]:pointer-events-none has-[[data-slot=input-group-control][data-disabled]]:opacity-64 has-[[data-slot=input-group-control][data-disabled]]:shadow-field-flat has-[[data-slot=input-group-control][data-disabled]]:before:shadow-none',
      ),
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
        ? [
            h.button(
              [
                h.Type('button'),
                h.DataAttribute('slot', 'combobox-clear'),
                h.AriaLabel(clearLabel),
                ...(isDisabled ? [h.Disabled(true), h.DataAttribute('disabled', '')] : []),
                ...(isDisabled || isReadOnly ? [] : [h.OnClick(toParentMessage(Message.ClickedClear()))]),
                h.Class(
                  cn(
                    fieldButtonClassName,
                    'absolute top-1/2 right-[calc((var(--spacing-control)-var(--spacing-control-xs))/2-1px)] -translate-y-1/2',
                  ),
                ),
              ],
              [icon('x', { className: 'pointer-events-none' })],
            ),
          ]
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

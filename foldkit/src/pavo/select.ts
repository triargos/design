import { Listbox } from '@foldkit/ui';
import { Array, Effect, Option, Schema, String, pipe } from 'effect';
import { Command, Update } from 'foldkit';
import * as Dom from 'foldkit/dom';
import { type Html, type HtmlBuilder, childAttributes } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { defineTaggedUnion } from 'foldkit/schema';

import { cn } from './cn.ts';
import { icon } from './icon.ts';
import * as Input from './input.ts';

export type SelectOption = Readonly<{
  value: string;
  label: string;
  description?: string | undefined;
}>;

export const DEFAULT_CUSTOM_LABEL = 'Custom';

export const Choice = defineTaggedUnion({
  Listed: { value: Schema.String },
  Custom: { text: Schema.String },
});
export type Choice = typeof Choice.Type;

export const choiceText = (maybeChoice: Option.Option<Choice>): string =>
  Option.match(maybeChoice, {
    onNone: () => '',
    onSome: (choice) => Choice.match(choice, { Listed: ({ value }) => value, Custom: ({ text }) => text }),
  });

const OPTION_KEY_PREFIX = 'option:';
const CUSTOM_KEY = 'custom';

export const Model = Listbox.Model;
export type Model = Listbox.Model;

export const Message = defineMessageUnion({
  GotListboxMessage: { message: Listbox.Message },
  CompletedFocusCustomInput: {},
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  Selected: { value: Schema.String },
  ChoseCustom: {},
});
export type OutMessage = typeof OutMessage.Type;

export type InitConfig = Readonly<{ id: string }>;

export const init = ({ id }: InitConfig): Model => Listbox.init({ id, isAnimated: true });

const ListboxBundle = Listbox.create<string>();

export const { buttonId } = Listbox;

export const customInputId = (id: string): string => `${id}-custom-input`;

const FocusCustomInput = Command.define('FocusCustomInput', {
  args: { id: Schema.String },
  messages: [Message.CompletedFocusCustomInput],
  execute: ({ id }) =>
    Dom.focus(`#${customInputId(id)}`).pipe(Effect.ignore, Effect.as(Message.CompletedFocusCustomInput())),
});

const toGotListboxMessage = (message: Listbox.Message): Message => Message.GotListboxMessage({ message });

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const toOutMessage = (key: string): OutMessage =>
  key === CUSTOM_KEY
    ? OutMessage.ChoseCustom()
    : OutMessage.Selected({ value: pipe(key, String.slice(OPTION_KEY_PREFIX.length)) });

const updateListbox = (model: Model, message: Listbox.Message): UpdateReturn => {
  const listboxUpdate = ListboxBundle.update(model, message);
  const commands = Command.mapMessages(listboxUpdate.commands, toGotListboxMessage);
  const maybeOutMessage = Option.map(Option.fromNullishOr(listboxUpdate.outMessage), ({ value }) =>
    toOutMessage(value),
  );
  const isCustomChosen = Option.exists(maybeOutMessage, (outMessage) => outMessage._tag === 'ChoseCustom');
  return Update.withOutMessage(
    {
      model: listboxUpdate.model,
      commands: isCustomChosen ? [...commands, FocusCustomInput({ id: model.id })] : commands,
    },
    Option.getOrUndefined(maybeOutMessage),
  );
};

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    GotListboxMessage: ({ message: listboxMessage }) => updateListbox(model, listboxMessage),
    CompletedFocusCustomInput: () => ({ model }),
  });

const Row = defineTaggedUnion({
  Listed: { value: Schema.String, label: Schema.String, group: Schema.String },
  Custom: { label: Schema.String },
});
type Row = typeof Row.Type;

const rowKey = (row: Row): string =>
  Row.match(row, {
    Listed: ({ value }) => `${OPTION_KEY_PREFIX}${value}`,
    Custom: () => CUSTOM_KEY,
  });

const rowGroup = (row: Row): string =>
  Row.match(row, {
    Listed: ({ group }) => group,
    Custom: () => CUSTOM_KEY,
  });

const rowLabel = (row: Row): string => row.label;

const triggerClassName = cn(
  Input.inputSurfaceVariants({ scope: 'self' }),
  "flex h-control w-full items-center justify-between gap-related px-[calc(var(--spacing-field-pad)-1px)] py-1 text-control whitespace-nowrap max-md:text-[1rem] data-placeholder:text-faint-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon [&_svg:not([class*='text-'])]:text-muted-foreground",
  'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-64 data-disabled:shadow-field-flat data-disabled:before:shadow-none',
);

export const contentClassName = cn(
  'relative isolate z-50 min-w-(--button-width) overflow-x-hidden overflow-y-auto rounded-popup bg-popover p-popup-inset text-popover-foreground shadow-popup outline-none [--outer-inset:var(--spacing-popup-inset)] [--outer-radius:var(--radius-popup)]',
  'origin-top data-[placement=top]:origin-bottom',
  'transition-[opacity,scale] duration-enter ease-enter data-closed:not-data-enter:opacity-0 motion-safe:data-closed:not-data-enter:scale-95',
  'data-enter:animate-in data-enter:transition-none data-enter:fade-in-0 data-enter:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2',
  'motion-reduce:zoom-in-100 motion-reduce:slide-in-from-top-0 motion-reduce:slide-in-from-left-0',
);

const itemClassName =
  "relative flex w-full cursor-default items-center gap-row-gap rounded-inner py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] pr-[calc(var(--spacing-menu-item-pad)+var(--spacing-icon)+var(--spacing-control-gap))] pl-menu-item-pad text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-active:bg-highlight data-active:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon [&_svg:not([class*='text-'])]:text-muted-foreground";

const labelClassName =
  'px-menu-item-pad pt-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] pb-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/4)] text-caption font-medium text-muted-foreground';

export const separatorClassName = 'pointer-events-none -mx-popup-inset my-popup-inset h-px bg-border';

export type Group = Readonly<{ label: string; options: ReadonlyArray<SelectOption> }>;

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  options?: ReadonlyArray<SelectOption> | undefined;
  groups?: ReadonlyArray<Group> | undefined;
  maybeValue: Option.Option<string>;
  placeholder?: string | undefined;
  allowCustom?: boolean | undefined;
  isCustomChosen?: boolean | undefined;
  customLabel?: string | undefined;
  ariaLabel?: string | undefined;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isDisabled?: boolean | undefined;
  className?: string | undefined;
}>;

const UNGROUPED = '';

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    options = [],
    groups = [],
    maybeValue,
    placeholder,
    allowCustom = false,
    isCustomChosen = false,
    customLabel = DEFAULT_CUSTOM_LABEL,
    ariaLabel,
    isInvalid = false,
    isReadOnly = false,
    isDisabled = false,
    className,
  } = config;

  const listedRows: ReadonlyArray<Row> = [
    ...Array.map(options, ({ value, label }) => Row.Listed({ value, label, group: UNGROUPED })),
    ...Array.flatMap(groups, (group) =>
      Array.map(group.options, ({ value, label }) => Row.Listed({ value, label, group: group.label })),
    ),
  ];
  const rows: ReadonlyArray<Row> = allowCustom ? [...listedRows, Row.Custom({ label: customLabel })] : listedRows;

  const maybeSelectedKey: Option.Option<string> = isCustomChosen
    ? Option.some(CUSTOM_KEY)
    : Option.map(maybeValue, (value) => `${OPTION_KEY_PREFIX}${value}`);

  const maybeTriggerLabel: Option.Option<string> = isCustomChosen
    ? Option.some(customLabel)
    : pipe(
        maybeValue,
        Option.map((value) =>
          pipe(
            listedRows,
            Array.findFirst((row) => rowKey(row) === `${OPTION_KEY_PREFIX}${value}`),
            Option.match({ onNone: () => value, onSome: rowLabel }),
          ),
        ),
      );

  const isPlaceholder = Option.isNone(maybeTriggerLabel);
  const isGrouped = allowCustom || Array.isReadonlyArrayNonEmpty(groups);

  const buttonContent = h.span(
    [h.Class('contents')],
    [
      h.span(
        [h.DataAttribute('slot', 'select-value'), h.Class('min-w-0 flex-1 truncate text-left')],
        [Option.getOrElse(maybeTriggerLabel, () => placeholder ?? '')],
      ),
      icon('chevron-down', { className: 'pointer-events-none size-icon text-faint-foreground' }),
    ],
  );

  const itemToConfig = (row: Row, { isSelected }: Readonly<{ isSelected: boolean }>) => ({
    className: itemClassName,
    content: h.span(
      [h.Class('contents')],
      [
        h.span(
          [h.Class('flex min-w-0 flex-1 items-center gap-row-gap whitespace-nowrap')],
          [row._tag === 'Custom' ? `${row.label}…` : row.label],
        ),
        ...(isSelected
          ? [
              h.span(
                [
                  h.Class(
                    'pointer-events-none absolute right-menu-item-pad flex size-icon-sm items-center justify-center',
                  ),
                ],
                [icon('check', { className: 'size-icon' })],
              ),
            ]
          : []),
      ],
    ),
  });

  return h.submodel({
    slotId: model.id,
    model,
    view: ListboxBundle.view,
    viewInputs: {
      items: Array.map(rows, rowKey),
      maybeSelectedValue: maybeSelectedKey,
      itemToConfig: (key, context) =>
        pipe(
          rows,
          Array.findFirst((row) => rowKey(row) === key),
          Option.match({
            onNone: () => ({ content: h.span([], [key]) }),
            onSome: (row) => itemToConfig(row, context),
          }),
        ),
      itemToSearchText: (key) =>
        pipe(
          rows,
          Array.findFirst((row) => rowKey(row) === key),
          Option.match({ onNone: () => key, onSome: rowLabel }),
        ),
      ...(isGrouped
        ? {
            itemGroupKey: (key: string) =>
              pipe(
                rows,
                Array.findFirst((row) => rowKey(row) === key),
                Option.match({ onNone: () => UNGROUPED, onSome: rowGroup }),
              ),
            groupToHeading: (groupKey: string) =>
              groupKey === UNGROUPED || groupKey === CUSTOM_KEY
                ? undefined
                : { content: h.span([], [groupKey]), className: labelClassName },
            groupClassName: 'scroll-my-popup-inset',
            separatorClassName,
          }
        : {}),
      buttonContent,
      buttonClassName: cn(triggerClassName, className),
      buttonAttributes: childAttributes([
        h.DataAttribute('slot', 'select-trigger'),
        ...(isPlaceholder ? [h.DataAttribute('placeholder', '')] : []),
        ...(isInvalid ? [h.AriaInvalid(true)] : []),
      ]),
      itemsClassName: contentClassName,
      itemsAttributes: childAttributes([
        h.DataAttribute('slot', 'select-content'),
        h.DataAttribute('surface', 'popup'),
      ]),
      anchor: { placement: 'bottom-start', gap: 4, padding: 8 },
      isDisabled,
      isReadOnly,
      isInvalid,
      ...(ariaLabel === undefined ? {} : { ariaLabel }),
    },
    toParentMessage: (message: Listbox.Message) => toParentMessage(toGotListboxMessage(message)),
  });
};

export type CustomInputConfig<Message> = Readonly<{
  selectId: string;
  value: string;
  onInput: (value: string) => Message;
  isShown: boolean;
  label?: string | undefined;
  placeholder?: string | undefined;
  isInvalid?: boolean | undefined;
  isDisabled?: boolean | undefined;
  className?: string | undefined;
}>;

export const customInput = <Message>(config: CustomInputConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const {
    selectId,
    value,
    onInput,
    isShown,
    label = DEFAULT_CUSTOM_LABEL,
    placeholder,
    isInvalid = false,
    isDisabled = false,
    className,
  } = config;

  return h.div(
    [
      h.DataAttribute('slot', 'select-custom-reveal'),
      ...(isShown ? [] : [h.DataAttribute('closed', ''), h.Inert(true), h.AriaHidden(true)]),
      h.Class(
        cn(
          '-mx-1 -mb-1 grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-fold-sm ease-spring',
          'data-closed:grid-rows-[0fr] data-closed:opacity-0 motion-reduce:transition-opacity motion-reduce:ease-enter',
        ),
      ),
    ],
    [
      h.div(
        [h.Class('min-h-0 overflow-hidden px-1 pb-1')],
        [
          h.div(
            [h.Class(cn('relative pt-related pl-[calc(var(--spacing-field-pad)+1rem)]', className))],
            [
              h.span([
                h.AriaHidden(true),
                h.Class(
                  'absolute top-0 left-[calc(var(--spacing-field-pad)+3px)] h-[calc(var(--spacing-related)+var(--spacing-control)/2+2px)] w-2.5 rounded-bl-[min(var(--radius-lg),var(--radius-control-sm))] border-b border-l border-border',
                ),
              ]),
              Input.view(
                {
                  id: customInputId(selectId),
                  value,
                  onInput,
                  ariaLabel: label,
                  isInvalid,
                  isDisabled,
                  ...(placeholder === undefined ? {} : { placeholder }),
                  attributes: [h.DataAttribute('slot', 'select-custom-input')],
                },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  );
};

import { Array, Effect, Match, Option, Schema, String, pipe } from 'effect';
import { Command as FoldkitCommand, type Update } from 'foldkit';
import * as Dom from 'foldkit/dom';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';
import { defineView } from 'foldkit/submodel';

import { cn } from './cn.ts';
import * as Dialog from './dialog.ts';
import { icon } from './icon.ts';
import type { Child, PartConfig } from './part.ts';

export const Model = Schema.Struct({
  id: Schema.String,
  query: Schema.String,
  maybeActiveValue: Schema.Option(Schema.String),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  UpdatedQuery: { query: Schema.String },
  ActivatedItem: { value: Schema.String, isKeyboard: Schema.Boolean },
  SelectedItem: { value: Schema.String },
  CompletedScrollItemIntoView: {},
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  Selected: { value: Schema.String },
});
export type OutMessage = typeof OutMessage.Type;

export type InitConfig = Readonly<{ id: string }>;

export const init = ({ id }: InitConfig): Model => ({ id, query: '', maybeActiveValue: Option.none() });

export const reset = (model: Model): Model =>
  modifyFields(model, { query: () => '', maybeActiveValue: () => Option.none() });

const itemId = (id: string, value: string): string => `${id}-item-${value.replaceAll(/\W/g, '-')}`;
export const inputId = (id: string): string => `${id}-input`;
const listId = (id: string): string => `${id}-list`;

const ScrollItemIntoView = FoldkitCommand.define('ScrollItemIntoView', {
  args: { id: Schema.String, value: Schema.String },
  messages: [Message.CompletedScrollItemIntoView],
  execute: ({ id, value }) =>
    Dom.scrollIntoViewIfNotVisible(`#${itemId(id, value)}`, { block: 'nearest' }).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedScrollItemIntoView()),
    ),
});

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    UpdatedQuery: ({ query }) => ({
      model: modifyFields(model, { query: () => query, maybeActiveValue: () => Option.none() }),
    }),
    ActivatedItem: ({ value, isKeyboard }) => ({
      model: modifyFields(model, { maybeActiveValue: () => Option.some(value) }),
      ...(isKeyboard ? { commands: [ScrollItemIntoView({ id: model.id, value })] } : {}),
    }),
    SelectedItem: ({ value }) => ({ model, outMessage: OutMessage.Selected({ value }) }),
    CompletedScrollItemIntoView: () => ({ model }),
  });

export type Item = Readonly<{
  value: string;
  keywords?: ReadonlyArray<string> | undefined;
  isDisabled?: boolean | undefined;
  className?: string | undefined;
  children: ReadonlyArray<Child>;
}>;

export type Group = Readonly<{
  heading?: string | undefined;
  hasSeparatorBefore?: boolean | undefined;
  items: ReadonlyArray<Item>;
}>;

const normalized = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();

const isMatch = (item: Item, query: string): boolean =>
  String.isEmpty(String.trim(query)) ||
  Array.some([item.value, ...(item.keywords ?? [])], (text) =>
    normalized(text).includes(normalized(String.trim(query))),
  );

export const filteredGroups = (groups: ReadonlyArray<Group>, query: string): ReadonlyArray<Group> =>
  pipe(
    groups,
    Array.map((group) => ({ ...group, items: Array.filter(group.items, (item) => isMatch(item, query)) })),
    Array.filter((group) => Array.isReadonlyArrayNonEmpty(group.items)),
  );

export const resultCount = (groups: ReadonlyArray<Group>, query: string): number =>
  Array.reduce(filteredGroups(groups, query), 0, (count, group) => count + group.items.length);

export type ViewInputs = Readonly<{
  groups: ReadonlyArray<Group>;
  placeholder?: string | undefined;
  emptyText?: string | undefined;
  label?: string | undefined;
  footer?: ReadonlyArray<Child> | undefined;
  className?: string | undefined;
  listClassName?: string | undefined;
}>;

const DEFAULT_LABEL = 'Commands';

const commandView = defineView<Model, Message, ViewInputs>((model, viewInputs, h): Html => {
  const { id, query, maybeActiveValue } = model;
  const { groups, placeholder, emptyText, label = DEFAULT_LABEL, footer, className, listClassName } = viewInputs;

  const visibleGroups = filteredGroups(groups, query);
  const enabledValues = pipe(
    visibleGroups,
    Array.flatMap((group) => group.items),
    Array.filter((item) => item.isDisabled !== true),
    Array.map((item) => item.value),
  );
  const maybeActive = pipe(
    maybeActiveValue,
    Option.filter((value) => Array.contains(enabledValues, value)),
    Option.orElse(() => Array.head(enabledValues)),
  );
  const activeIndex = pipe(
    maybeActive,
    Option.flatMap((value) => Array.findFirstIndex(enabledValues, (enabledValue) => enabledValue === value)),
  );

  const activatedAt = (index: number): Option.Option<Message> =>
    Option.map(Array.get(enabledValues, index), (value) => Message.ActivatedItem({ value, isKeyboard: true }));

  const handleKeyDown = (key: string): Option.Option<Message> =>
    Match.value(key).pipe(
      Match.when('ArrowDown', () =>
        activatedAt(
          Option.match(activeIndex, {
            onNone: () => 0,
            onSome: (index) => Math.min(index + 1, enabledValues.length - 1),
          }),
        ),
      ),
      Match.when('ArrowUp', () =>
        activatedAt(Option.match(activeIndex, { onNone: () => 0, onSome: (index) => Math.max(index - 1, 0) })),
      ),
      Match.when('Home', () => activatedAt(0)),
      Match.when('End', () => activatedAt(enabledValues.length - 1)),
      Match.when('Enter', () => Option.map(maybeActive, (value) => Message.SelectedItem({ value }))),
      Match.orElse(() => Option.none()),
    );

  const itemView = (item: Item): Html => {
    const isActive = Option.exists(maybeActive, (value) => value === item.value);
    const isDisabled = item.isDisabled === true;
    return h.keyed('div')(
      item.value,
      [
        h.Id(itemId(id, item.value)),
        h.Role('option'),
        h.AriaSelected(isActive),
        h.DataAttribute('slot', 'command-item'),
        h.DataAttribute('selected', isActive ? 'true' : 'false'),
        ...(isDisabled
          ? [h.AriaDisabled(true), h.DataAttribute('disabled', 'true')]
          : [
              h.OnClick(Message.SelectedItem({ value: item.value })),
              ...(isActive
                ? []
                : [
                    h.OnPointerMove(() => Option.some(Message.ActivatedItem({ value: item.value, isKeyboard: false }))),
                  ]),
            ]),
        h.Class(
          cn(
            "group/command-item relative flex cursor-default items-center gap-row-gap rounded-inner px-row-pad-x py-[calc((var(--spacing-control-lg)-var(--text-control--line-height))/2)] text-control outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:text-disabled-foreground data-[selected=true]:bg-highlight data-[selected=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon data-[selected=true]:*:[svg]:text-foreground",
            item.className,
          ),
        ),
      ],
      item.children,
    );
  };

  const isSearching = String.isNonEmpty(String.trim(query));

  const groupView = (group: Group, index: number): ReadonlyArray<Html> => {
    const headingId = `${id}-group-${index}`;
    return [
      ...(group.hasSeparatorBefore === true && !isSearching && index > 0
        ? [
            h.div([
              h.Role('separator'),
              h.DataAttribute('slot', 'command-separator'),
              h.Class('-mx-list-inset my-list-inset h-px bg-border'),
            ]),
          ]
        : []),
      h.div(
        [
          h.Role('group'),
          h.DataAttribute('slot', 'command-group'),
          ...(group.heading === undefined ? [] : [h.AriaLabelledBy(headingId)]),
          h.Class(
            cn(
              'overflow-hidden text-foreground',
              index > 0 && (group.hasSeparatorBefore !== true || isSearching) && 'pt-list-inset',
            ),
          ),
        ],
        [
          ...(group.heading === undefined
            ? []
            : [
                h.div(
                  [
                    h.Id(headingId),
                    h.AriaHidden(true),
                    h.Class('px-row-pad-x py-(--command-heading-pad-y) text-caption font-medium text-muted-foreground'),
                  ],
                  [group.heading],
                ),
              ]),
          ...Array.map(group.items, itemView),
        ],
      ),
    ];
  };

  return h.div(
    [
      h.DataAttribute('slot', 'command'),
      h.Class(
        cn(
          'flex size-full flex-col overflow-hidden bg-transparent text-popover-foreground [--outer-inset:var(--spacing-list-inset)] [--outer-radius:var(--radius-popup)] in-data-[slot=dialog-content]:[--outer-radius:var(--radius-dialog)]',
          className,
        ),
      ),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'command-input-wrapper'),
          h.Class(
            'flex h-(--command-input-height) shrink-0 items-center gap-(--command-input-gap) border-b px-[calc(var(--spacing-list-inset)+var(--spacing-row-pad-x))]',
          ),
        ],
        [
          icon('search', { className: 'size-icon shrink-0 text-muted-foreground' }),
          h.input([
            h.Id(inputId(id)),
            h.Type('text'),
            h.Role('combobox'),
            h.AriaExpanded(true),
            h.AriaControls(listId(id)),
            h.AriaLabel(label),
            h.Attribute('aria-autocomplete', 'list'),
            h.Autocomplete('off'),
            h.Spellcheck(false),
            h.Value(query),
            ...(placeholder === undefined ? [] : [h.Placeholder(placeholder)]),
            ...Option.match(maybeActive, {
              onNone: () => [],
              onSome: (value) => [h.AriaActiveDescendant(itemId(id, value))],
            }),
            h.OnInput((nextQuery) => Message.UpdatedQuery({ query: nextQuery })),
            h.OnKeyDownPreventDefault(handleKeyDown),
            h.DataAttribute('slot', 'command-input'),
            h.Class(
              'h-full w-full min-w-0 bg-transparent text-body outline-hidden placeholder:text-faint-foreground disabled:cursor-not-allowed disabled:text-disabled-foreground',
            ),
          ]),
        ],
      ),
      h.div(
        [
          h.Id(listId(id)),
          h.Role('listbox'),
          h.AriaLabel(label),
          h.DataAttribute('slot', 'command-list'),
          h.Class(
            cn(
              'no-scrollbar max-h-96 scroll-py-list-inset overflow-x-hidden overflow-y-auto p-list-inset outline-none',
              listClassName,
            ),
          ),
        ],
        Array.match(visibleGroups, {
          onEmpty: () => [
            h.div(
              [h.DataAttribute('slot', 'command-empty'), h.Class('py-(--command-empty-pad-y) text-center text-body')],
              [emptyText ?? ''],
            ),
          ],
          onNonEmpty: (nonEmptyGroups) => Array.flatMap(nonEmptyGroups, groupView),
        }),
      ),
      ...(footer ?? []),
    ],
  );
});

export type ViewConfig<ParentMessage> = ViewInputs &
  Readonly<{
    model: Model;
    toParentMessage: (message: Message) => ParentMessage;
  }>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, ...viewInputs } = config;
  return h.submodel({ slotId: model.id, model, view: commandView, viewInputs, toParentMessage });
};

export type DialogConfig<ParentMessage> = Readonly<{
  model: Dialog.Model;
  toParentMessage: (message: Dialog.Message) => ParentMessage;
  title: string;
  description?: string | undefined;
  children: ReadonlyArray<Child>;
}>;

export const dialog = <ParentMessage>(config: DialogConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, title, description, children } = config;
  return Dialog.view(
    {
      model,
      toParentMessage,
      size: 'lg',
      className: 'top-[12dvh] max-h-[76dvh] translate-y-0',
      isCloseButtonShown: false,
      hasDescription: description !== undefined,
      content: (render) => [
        Dialog.header(
          {
            className: 'sr-only',
            children: [
              Dialog.title({ render: render.title, children: [title] }, h),
              ...(description === undefined
                ? []
                : [Dialog.description({ render: render.description, children: [description] }, h)]),
            ],
          },
          h,
        ),
        Dialog.body({ className: 'gap-0 overflow-hidden p-0', children }, h),
      ],
    },
    h,
  );
};

export const shortcut = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'command-shortcut'),
      h.Class(
        cn(
          'ml-auto text-caption tracking-widest text-muted-foreground group-data-[selected=true]/command-item:text-foreground',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const footer = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'command-footer'),
      h.Class(
        cn(
          'flex h-(--command-footer-height) shrink-0 items-center justify-between gap-group border-t bg-muted px-[calc(var(--spacing-list-inset)+var(--spacing-row-pad-x))] text-caption text-muted-foreground',
          '**:data-[slot=kbd]:bg-card **:data-[slot=kbd]:shadow-raised dark:**:data-[slot=kbd]:bg-foreground/10',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

import { Array, Option, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Accordion from '../pavo/accordion.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import * as Sheet from '../pavo/sheet.ts';

export const title = 'Accordion';
export const description = 'Sections that open in place, for content people scan by title.';

const QUESTIONS = [
  {
    value: 'invite',
    question: 'How do I invite a teammate?',
    answer: 'Open Members, choose Invite and enter their email. They join as soon as they accept.',
  },
  {
    value: 'documents',
    question: 'Where do shared documents live?',
    answer: 'Every project has a Documents tab; files open right in the browser.',
  },
  {
    value: 'billing',
    question: 'How do I change the billing email?',
    answer: 'Under Settings → Billing. Invoices go to the new address from the next cycle.',
  },
] as const;

const SECTIONS = [
  {
    value: 'roles',
    title: 'Roles',
    body: 'Owners manage billing and members. Admins manage projects. Members work on the tasks they are assigned.',
  },
  {
    value: 'guests',
    title: 'Guests',
    body: 'Guests see only the projects they are invited to and cannot invite anyone else.',
  },
  {
    value: 'removal',
    title: 'Removing a member',
    body: 'Their tasks stay in the project, unassigned. Documents they uploaded stay where they are.',
  },
] as const;

const ALL_QUESTION_VALUES = Array.map(QUESTIONS, ({ value }) => value);

const OpenValues = Schema.Array(Schema.String);

export const Model = Schema.Struct({
  defaultOpen: OpenValues,
  flushOpen: OpenValues,
  multipleOpen: OpenValues,
  controlledOpen: OpenValues,
  inACardOpen: OpenValues,
  inASheetOpen: OpenValues,
  permissionsSheet: Sheet.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ChangedDefaultOpen: { openValues: OpenValues },
  ChangedFlushOpen: { openValues: OpenValues },
  ChangedMultipleOpen: { openValues: OpenValues },
  ChangedControlledOpen: { openValues: OpenValues },
  ClickedToggleAll: {},
  ChangedInACardOpen: { openValues: OpenValues },
  ChangedInASheetOpen: { openValues: OpenValues },
  ClickedMemberPermissions: {},
  GotPermissionsSheetMessage: { message: Sheet.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    defaultOpen: ['invite'],
    flushOpen: ['documents'],
    multipleOpen: ['invite', 'billing'],
    controlledOpen: [],
    inACardOpen: ['invite'],
    inASheetOpen: ['roles'],
    permissionsSheet: Sheet.init({ id: 'accordion-permissions-sheet', isAnimated: true }),
  },
});

const isAllOpen = (model: Model): boolean => model.controlledOpen.length === QUESTIONS.length;

const toPermissionsSheetMessage = (message: Sheet.Message): Message => Message.GotPermissionsSheetMessage({ message });

const permissionsSheetFold = {
  read: (model: Model) => Option.some(model.permissionsSheet),
  write: (model: Model, nextPermissionsSheet: Sheet.Model) =>
    modifyFields(model, { permissionsSheet: () => nextPermissionsSheet }),
  toParentMessage: toPermissionsSheetMessage,
  foldOutMessage: Sheet.OutMessage.match<Update.Step<Model, Message>>({
    Opened: () => (stepModel) => ({ model: stepModel }),
    Closed: () => (stepModel) => ({ model: stepModel }),
  }),
};

const foldPermissionsSheet = Update.foldChild({ update: Sheet.update, ...permissionsSheetFold });
const foldPermissionsSheetOpen = Update.foldChildStep({ update: Sheet.open, ...permissionsSheetFold });

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ChangedDefaultOpen: ({ openValues }) => ({ model: modifyFields(model, { defaultOpen: () => openValues }) }),
    ChangedFlushOpen: ({ openValues }) => ({ model: modifyFields(model, { flushOpen: () => openValues }) }),
    ChangedMultipleOpen: ({ openValues }) => ({ model: modifyFields(model, { multipleOpen: () => openValues }) }),
    ChangedControlledOpen: ({ openValues }) => ({ model: modifyFields(model, { controlledOpen: () => openValues }) }),
    ClickedToggleAll: () => ({
      model: modifyFields(model, { controlledOpen: () => (isAllOpen(model) ? [] : ALL_QUESTION_VALUES) }),
    }),
    ChangedInACardOpen: ({ openValues }) => ({ model: modifyFields(model, { inACardOpen: () => openValues }) }),
    ChangedInASheetOpen: ({ openValues }) => ({ model: modifyFields(model, { inASheetOpen: () => openValues }) }),
    ClickedMemberPermissions: () => foldPermissionsSheetOpen(model),
    GotPermissionsSheetMessage: ({ message }) => foldPermissionsSheet(model, message),
  });

const questionItems = (contentClassName?: string): ReadonlyArray<Accordion.Item> =>
  Array.map(QUESTIONS, ({ value, question, answer }) => ({
    value,
    trigger: [question],
    content: [answer],
    contentClassName,
  }));

const flush = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-md',
      children: [
        Card.header({ children: [Card.title({ children: ['Questions'] }, h)] }, h),
        Card.content(
          {
            className: 'overflow-hidden',
            children: [
              Accordion.view(
                {
                  id: 'accordion-flush',
                  variant: 'flush',
                  items: questionItems('text-muted-foreground'),
                  openValues: model.flushOpen,
                  onOpenValuesChange: (openValues) => Message.ChangedFlushOpen({ openValues }),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const controlled = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex max-w-md flex-col items-start gap-2')],
    [
      Button.view({ onClick: Message.ClickedToggleAll(), children: [isAllOpen(model) ? 'Close all' : 'Open all'] }, h),
      Accordion.view(
        {
          id: 'accordion-controlled',
          isMultiple: true,
          className: 'w-full',
          items: questionItems(),
          openValues: model.controlledOpen,
          onOpenValuesChange: (openValues) => Message.ChangedControlledOpen({ openValues }),
        },
        h,
      ),
    ],
  );

const inACard = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-md',
      children: [
        Card.header({ children: [Card.title({ children: ['Questions'] }, h)] }, h),
        Card.content(
          {
            className: 'p-2',
            children: [
              Accordion.view(
                {
                  id: 'accordion-in-a-card',
                  items: questionItems(),
                  openValues: model.inACardOpen,
                  onOpenValuesChange: (openValues) => Message.ChangedInACardOpen({ openValues }),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const inASheet = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  Button.view({ onClick: Message.ClickedMemberPermissions(), children: ['Member permissions'] }, h),
  Sheet.view(
    {
      model: model.permissionsSheet,
      toParentMessage: toPermissionsSheetMessage,
      hasDescription: true,
      content: (render) => [
        Sheet.header(
          {
            children: [
              Sheet.title({ render: render.title, children: ['Member permissions'] }, h),
              Sheet.description(
                { render: render.description, children: ['What each member of the workspace can do.'] },
                h,
              ),
            ],
          },
          h,
        ),
        Sheet.body(
          {
            children: [
              Accordion.view(
                {
                  id: 'accordion-in-a-sheet',
                  variant: 'flush',
                  items: Array.map(SECTIONS, ({ value, title: sectionTitle, body }) => ({
                    value,
                    trigger: [sectionTitle],
                    content: [body],
                    contentClassName: 'text-muted-foreground',
                  })),
                  openValues: model.inASheetOpen,
                  onOpenValuesChange: (openValues) => Message.ChangedInASheetOpen({ openValues }),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  ),
];

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description,
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'One open at a time.',
            children: [
              Accordion.view(
                {
                  id: 'accordion-default',
                  className: 'max-w-md',
                  items: questionItems(),
                  openValues: model.defaultOpen,
                  onOpenValuesChange: (openValues) => Message.ChangedDefaultOpen({ openValues }),
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Flush',
            description: [
              code("variant: 'flush'", h),
              ' in ',
              code("Card.content({ className: 'overflow-hidden' })", h),
              ': rows to the card edge, a ',
              code('row-hover', h),
              ' fill, the content indented to the title.',
            ],
            isBare: true,
            children: [flush(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Multiple',
            description: [code('isMultiple', h), ': several sections open side by side.'],
            children: [
              Accordion.view(
                {
                  id: 'accordion-multiple',
                  isMultiple: true,
                  className: 'max-w-md',
                  items: questionItems(),
                  openValues: model.multipleOpen,
                  onOpenValuesChange: (openValues) => Message.ChangedMultipleOpen({ openValues }),
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Controlled',
            description: [
              code('openValues', h),
              ' and ',
              code('onOpenValuesChange', h),
              ': open or close all from outside.',
            ],
            children: [controlled(model, h)],
          },
          h,
        ),
        exampleSection({ title: 'In a card', isBare: true, children: [inACard(model, h)] }, h),
        exampleSection(
          {
            title: 'In a sheet',
            description: [code("variant: 'flush'", h), ' in a ', code('sheet-body', h), ' runs to the sheet’s edge.'],
            children: inASheet(model, h),
          },
          h,
        ),
      ],
    },
    h,
  ),
);

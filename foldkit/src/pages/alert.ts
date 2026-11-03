import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { exampleSection, foundationSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Alert from '../pavo/alert.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';

export const title = 'Alert';
export const description = 'An inline notice.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const INTENTS = [
  {
    intent: 'info',
    use: 'Default. Plain information: how something works, what happens next.',
    title: 'New fields available',
    body: 'Members see them after their next sign-in.',
  },
  {
    intent: 'success',
    use: 'A finished step the user should know about.',
    title: 'Import finished',
    body: '248 tasks were added to the project.',
  },
  {
    intent: 'warning',
    use: 'Needs attention, but nothing is broken yet.',
    title: 'Your trial ends on March 31',
    body: 'Add a payment method to keep your projects.',
  },
  {
    intent: 'destructive',
    use: 'Something failed or will be lost.',
    title: 'Sync failed',
    body: '3 documents could not be uploaded.',
  },
  {
    intent: 'neutral',
    use: 'An aside that is not news, inside a dense surface.',
    title: 'Only admins see this section',
    body: 'Members cannot open it.',
  },
] as const;

const titledContent = (alertTitle: string, body: string, h: HtmlBuilder<Message>): Html =>
  Alert.content({ children: [h.p([h.Class('font-medium')], [alertTitle]), h.p([], [body])] }, h);

const intents = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-md flex-col gap-2')],
    INTENTS.map(({ intent, title: alertTitle, body }) =>
      Alert.view({ intent, children: [titledContent(alertTitle, body, h)] }, h),
    ),
  );

const withAction = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-lg flex-col gap-2')],
    [
      Alert.view(
        {
          intent: 'destructive',
          children: [
            titledContent('Sync failed', '3 documents could not be uploaded.', h),
            Alert.action({ children: [Button.view({ children: ['Try again'] }, h)] }, h),
          ],
        },
        h,
      ),
      Alert.view(
        {
          children: [
            Alert.content({ children: ['4 members joined this week.'] }, h),
            Alert.action({ children: [Button.view({ children: ['View'] }, h)] }, h),
          ],
        },
        h,
      ),
    ],
  );

const inASection = (h: HtmlBuilder<Message>): Html =>
  h.section(
    [h.Class('flex w-full max-w-2xl flex-col gap-group')],
    [
      h.hgroup(
        [h.Class('flex flex-col gap-tight px-[calc(--spacing(1)+1px+var(--spacing-group))]')],
        [
          h.h2([h.Class('text-heading text-balance')], ['Billing']),
          h.p([h.Class('text-body text-pretty text-muted-foreground')], ['How the workspace pays.']),
        ],
      ),
      Alert.view(
        {
          intent: 'warning',
          children: [titledContent('Your trial ends on March 31', 'Add a payment method to keep your projects.', h)],
        },
        h,
      ),
      Card.view(
        {
          children: [
            Card.header(
              {
                children: [
                  Card.title({ children: ['Payment method'] }, h),
                  Card.description({ children: ['Invoices are charged to this card.'] }, h),
                ],
              },
              h,
            ),
            Card.content(
              {
                className: 'p-card',
                children: [h.p([h.Class('text-body text-muted-foreground')], ['No card on file.'])],
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  );

const specimenRow = (name: string, meta: string, child: Html, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Class(
        'grid gap-related border-t border-border p-group first:border-t-0 md:grid-cols-[11rem_1fr] md:items-center md:gap-group',
      ),
    ],
    [
      h.div(
        [h.Class('flex flex-col')],
        [
          h.span([h.Class('text-body font-medium')], [name]),
          h.span([h.Class('text-caption text-muted-foreground')], [meta]),
        ],
      ),
      h.div([h.Class('min-w-0')], [child]),
    ],
  );

const whenToUse = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.content(
          {
            className: 'flex flex-col overflow-hidden',
            children: INTENTS.map(({ intent, use, title: alertTitle, body }) =>
              specimenRow(intent, use, Alert.view({ intent, children: [titledContent(alertTitle, body, h)] }, h), h),
            ),
          },
          h,
        ),
      ],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'An inline notice. Text only: the intent says what kind of notice it is, the first line says the rest. Always the subtle emphasis of its intent.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'Info, body only.',
            children: [
              Alert.view(
                {
                  className: 'max-w-md',
                  children: [Alert.content({ children: ['Members see the new fields after their next sign-in.'] }, h)],
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Intents',
            description: 'The intent’s subtle fill and its text; no edge, no icon.',
            children: [intents(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With title',
            description:
              'Title and body lines sit flush; the line height is the gap. The title is font-medium and keeps the intent color.',
            children: [
              Alert.view(
                {
                  intent: 'warning',
                  className: 'max-w-md',
                  children: [
                    titledContent('Your trial ends on March 31', 'Add a payment method to keep your projects.', h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With action',
            description:
              'One 40px raised button, 6px from the edge on every side; rounded-inner keeps its corners concentric. Below sm the action stacks under the text.',
            children: [withAction(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'In a section',
            description:
              'An alert sits between cards, one group step apart. Its text starts 28px in, on the edge of the section title and the card headers.',
            isBare: true,
            children: [inASection(h)],
          },
          h,
        ),
        foundationSection(
          { title: 'When to use', description: 'Each intent and what it is for.', children: [whenToUse(h)] },
          h,
        ),
      ],
    },
    h,
  ),
);

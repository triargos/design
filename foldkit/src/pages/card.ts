import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Badge from '../pavo/badge.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import * as Empty from '../pavo/empty.ts';
import * as Field from '../pavo/field.ts';
import { icon } from '../pavo/icon.ts';
import * as Input from '../pavo/input.ts';
import * as Item from '../pavo/item.ts';

export const title = 'Card';
export const description = 'The content block: a shell around a card.';

export const Model = Schema.Struct({
  isProfileDirty: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  UpdatedProfileName: { value: Schema.String },
  ClickedSaveProfile: {},
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { isProfileDirty: true },
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    UpdatedProfileName: () => ({ model: modifyFields(model, { isProfileDirty: () => true }) }),
    ClickedSaveProfile: () => ({ model: modifyFields(model, { isProfileDirty: () => false }) }),
  });

const MEMBERS = [
  { name: 'Jordan Lee', role: 'Admin · Design' },
  { name: 'Sam Rivera', role: 'Engineering' },
  { name: 'Priya Patel', role: 'Design' },
] as const;

const mutedText = (text: string, h: HtmlBuilder<Message>): Html =>
  h.p([h.Class('text-body text-muted-foreground')], [text]);

const titledCard = (
  cardTitle: string,
  contentClassName: string,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
  className?: string,
): Html =>
  Card.view(
    {
      className,
      children: [
        Card.header({ children: [Card.title({ children: [cardTitle] }, h)] }, h),
        Card.content({ className: contentClassName, children }, h),
      ],
    },
    h,
  );

const defaultCard = (h: HtmlBuilder<Message>): Html =>
  titledCard('Files', 'p-card', [mutedText('Card content.', h)], h, 'w-full max-w-xl');

const withDescription = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header(
          {
            children: [
              Card.title({ children: ['Notifications'] }, h),
              Card.description({ children: ['When we send you an email.'] }, h),
            ],
          },
          h,
        ),
        Card.content({ className: 'p-card', children: [mutedText('Card content.', h)] }, h),
      ],
    },
    h,
  );

const withActions = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header(
          {
            actions: [
              Button.view({ size: 'sm', children: [icon('plus', { dataIcon: 'inline-start' }), 'Invite'] }, h),
              Button.view({ size: 'icon-sm', ariaLabel: 'More', children: [icon('dots')] }, h),
            ],
            children: [Card.title({ children: ['Members'] }, h)],
          },
          h,
        ),
        Card.content(
          {
            className: 'overflow-hidden',
            children: [
              Item.list(
                {
                  children: MEMBERS.map((member) =>
                    Item.view(
                      {
                        children: [
                          Item.media({ variant: 'icon', children: [icon('users')] }, h),
                          Item.content(
                            {
                              children: [
                                Item.title({ children: [member.name] }, h),
                                Item.description({ children: [member.role] }, h),
                              ],
                            },
                            h,
                          ),
                          Item.actions(
                            {
                              children: [
                                Button.view(
                                  {
                                    emphasis: 'ghost',
                                    size: 'icon-sm',
                                    ariaLabel: `Actions for ${member.name}`,
                                    children: [icon('dots')],
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
                  ),
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

const noHeader = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [Card.content({ className: 'p-card', children: [mutedText('A card without a header.', h)] }, h)],
    },
    h,
  );

const withFooter = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header(
          {
            children: [
              Card.title({ children: ['Profile'] }, h),
              Card.description({ children: ['How your teammates see you.'] }, h),
            ],
          },
          h,
        ),
        Card.content(
          {
            className: 'p-card',
            children: [
              Field.view(
                {
                  children: [
                    Field.label({ forId: 'card-name', children: ['Name'] }, h),
                    Input.view(
                      {
                        id: 'card-name',
                        defaultValue: 'Jordan Lee',
                        onInput: (value) => Message.UpdatedProfileName({ value }),
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
        Card.footer(
          {
            isShown: model.isProfileDirty,
            className: 'flex items-center justify-end gap-related',
            children: [
              h.span([h.Class('text-body text-muted-foreground')], ['Unsaved changes']),
              Button.view({ intent: 'primary', onClick: Message.ClickedSaveProfile(), children: ['Save'] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const stacked = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-xl flex-col gap-group')],
    [
      h.div(
        [h.Class('grid gap-group sm:grid-cols-2')],
        ['Website redesign', 'Mobile app'].map((cardTitle) =>
          titledCard(
            cardTitle,
            'flex flex-col items-start gap-2 p-card',
            [Badge.view({ intent: 'success', children: ['Active'] }, h), mutedText('Two cards side by side.', h)],
            h,
          ),
        ),
      ),
      titledCard('Documents', 'p-card', [mutedText('One card across the full width.', h)], h),
    ],
  );

const destructive = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      intent: 'destructive',
      className: 'w-full max-w-xl',
      children: [
        Card.header({ children: [Card.title({ children: ['Delete workspace'] }, h)] }, h),
        Card.content(
          {
            className:
              'flex items-center justify-between gap-group p-1 max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5 max-sm:pt-2.5',
            children: [
              h.p(
                [
                  h.Class(
                    'min-w-0 px-[calc(var(--spacing-card)-var(--spacing-tight))] text-body text-muted-foreground',
                  ),
                ],
                ['Removes every project, task and document for good.'],
              ),
              Button.view(
                {
                  intent: 'destructive',
                  className: 'rounded-inner [--outer-inset:--spacing(2)]',
                  children: ['Delete workspace'],
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

const empty = (h: HtmlBuilder<Message>): Html =>
  titledCard(
    'Documents',
    '',
    [
      Empty.view(
        {
          size: 'sm',
          children: [
            Empty.media({}, h),
            Empty.title({ children: ['No documents yet'] }, h),
            Empty.description({ children: ['Uploaded documents show up here.'] }, h),
          ],
        },
        h,
      ),
    ],
    h,
    'w-full max-w-xl',
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description,
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'The header is a one-line label strip on the shell.',
            isBare: true,
            children: [defaultCard(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With description',
            description: 'One sentence; long copy makes the shell read as a gray block.',
            isBare: true,
            children: [withDescription(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With actions',
            description:
              'Header actions are raised sm / icon-sm buttons; row actions inside the list stay ghost. Both end on one column. A flush ItemList: CardContent with overflow-hidden.',
            isBare: true,
            children: [withActions(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'No header',
            description: 'Content alone; the shell shows as a 4px rim.',
            isBare: true,
            children: [noHeader(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With footer',
            description: [code('Card.footer isShown', h), ' while the form is dirty; type to show it again.'],
            isBare: true,
            children: [withFooter(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Stacked',
            description: 'Peer cards sit one group step apart, in a stack or in columns.',
            isBare: true,
            children: [stacked(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Destructive',
            description: [
              code("intent: 'destructive'", h),
              ' marks only the title. The action row stacks below sm, the button full width.',
            ],
            isBare: true,
            children: [destructive(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Empty',
            description: [code("Empty size: 'sm'", h), ' in the content.'],
            isBare: true,
            children: [empty(h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

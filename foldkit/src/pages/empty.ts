import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import * as Empty from '../pavo/empty.ts';
import { icon } from '../pavo/icon.ts';

export const title = 'Empty';
export const description = 'An area with nothing to show yet.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const invoicesEmpty = (size: Empty.EmptySize, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.content(
          {
            className: 'p-4',
            children: [
              Empty.view(
                {
                  size,
                  children: [
                    Empty.media({}, h),
                    Empty.title({ children: ['No invoices'] }, h),
                    Empty.description({ children: ['Invoices for this workspace show up here.'] }, h),
                  ],
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

const inCard = (cardTitle: string, empty: Html, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header({ children: [Card.title({ children: [cardTitle] }, h)] }, h),
        Card.content({ className: 'p-4', children: [empty] }, h),
      ],
    },
    h,
  );

const defaultExample = (h: HtmlBuilder<Message>): Html =>
  inCard(
    'Documents',
    Empty.view(
      {
        children: [
          Empty.media({}, h),
          Empty.title({ children: ['No documents yet'] }, h),
          Empty.description({ children: ['Uploaded documents show up here, ready to share with the team.'] }, h),
          Empty.content(
            {
              children: [
                Button.view({ children: [icon('upload', { dataIcon: 'inline-start' }), 'Upload documents'] }, h),
              ],
            },
            h,
          ),
        ],
      },
      h,
    ),
    h,
  );

const errorExample = (h: HtmlBuilder<Message>): Html =>
  inCard(
    'Recent activity',
    Empty.view(
      {
        attributes: [h.Role('alert')],
        children: [
          Empty.media({ variant: 'icon', children: [icon('cloud-off')] }, h),
          Empty.title({ children: ['Can’t reach the server'] }, h),
          Empty.description(
            { children: ['The activity couldn’t be loaded. Your work is saved; try again in a minute.'] },
            h,
          ),
          Empty.content({ children: [Button.view({ intent: 'primary', children: ['Try again'] }, h)] }, h),
        ],
      },
      h,
    ),
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'An area with nothing to show yet: a skeleton of the content, a title, one line, at most one action. A failure is the same shape with an icon and role="alert".',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [
              code('Empty.media', h),
              ' (a skeleton stack), ',
              code('Empty.title', h),
              ', ',
              code('Empty.description', h),
              ', ',
              code('Empty.content', h),
              '.',
            ],
            isBare: true,
            children: [defaultExample(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Sizes',
            description: [code("size: 'sm'", h), ' for a section inside a card.'],
            isBare: true,
            children: [
              h.div(
                [h.Class('grid w-full max-w-2xl gap-4 sm:grid-cols-2')],
                [invoicesEmpty('default', h), invoicesEmpty('sm', h)],
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Bordered',
            description: 'A dashed edge, for an empty area on the page itself, not in a card.',
            isBare: true,
            children: [
              Empty.view(
                {
                  isBordered: true,
                  className: 'w-full max-w-xl',
                  children: [
                    Empty.media({}, h),
                    Empty.title({ children: ['No projects yet'] }, h),
                    Empty.description({ children: ['Create a project to group tasks and documents.'] }, h),
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
            title: 'Error',
            description: [
              code("role: 'alert'", h),
              ' and ',
              code("Empty.media variant: 'icon'", h),
              ': what failed, and the next step.',
            ],
            isBare: true,
            children: [errorExample(h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

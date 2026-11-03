import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Breadcrumb from '../pavo/breadcrumb.ts';
import type { Child } from '../pavo/part.ts';

export const title = 'Breadcrumb';
export const description = 'Where a page sits, as links back up the tree.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const trail = (items: ReadonlyArray<Html>, separator: () => Html, h: HtmlBuilder<Message>): Html =>
  Breadcrumb.view(
    {
      children: [
        Breadcrumb.list(
          {
            children: items.flatMap((item, index) =>
              index === 0
                ? [Breadcrumb.item({ children: [item] }, h)]
                : [separator(), Breadcrumb.item({ children: [item] }, h)],
            ),
          },
          h,
        ),
      ],
    },
    h,
  );

const link = (href: string, label: string, h: HtmlBuilder<Message>): Html =>
  Breadcrumb.link({ href, children: [label] }, h);

const current = (label: string, h: HtmlBuilder<Message>): Html => Breadcrumb.page({ children: [label] }, h);

const chevron = (h: HtmlBuilder<Message>) => (): Html => Breadcrumb.separator({}, h);

const customSeparator = (children: ReadonlyArray<Child>, h: HtmlBuilder<Message>) => (): Html =>
  Breadcrumb.separator({ children }, h);

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description,
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [
              code('Breadcrumb.link', h),
              ' up the tree; ',
              code('Breadcrumb.page', h),
              ' is the current page.',
            ],
            children: [
              trail(
                [link('#workspace', 'Workspace', h), link('#projects', 'Projects', h), current('Website redesign', h)],
                chevron(h),
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With ellipsis',
            description: [code('Breadcrumb.ellipsis', h), ' stands for the levels between.'],
            children: [
              trail(
                [link('#workspace', 'Workspace', h), Breadcrumb.ellipsis({}, h), current('Homepage copy', h)],
                chevron(h),
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Custom separator',
            description: [code('Breadcrumb.separator', h), ' children replace the chevron.'],
            children: [
              trail(
                [link('#workspace', 'Workspace', h), link('#projects', 'Projects', h), current('Website redesign', h)],
                customSeparator(['/'], h),
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
);

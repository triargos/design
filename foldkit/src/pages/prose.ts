import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Card from '../pavo/card.ts';
import { cn } from '../pavo/cn.ts';
import { inputSurfaceVariants } from '../pavo/input.ts';
import * as Prose from '../pavo/prose.ts';

export const title = 'Prose';
export const description = 'Rendered rich text in the body role.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const DOCUMENT_HTML =
  '<h2>Meeting notes</h2><p>We agreed to ship the <em>client portal</em> in two steps.</p><ul><li><p>Step 1: read-only documents</p></li><li><p>Step 2: comments and uploads</p></li></ul><p>Next review: <strong>Friday</strong>.</p>';

const announcement = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.content(
          {
            className: 'p-card',
            children: [
              Prose.view(
                {
                  children: [
                    h.h1([], ['Workspace update: March']),
                    h.p(
                      [],
                      [
                        'Projects now have ',
                        h.strong([], ['due dates']),
                        ' and a weekly digest. Everything below is live for every member of the workspace.',
                      ],
                    ),
                    h.h2([], ['What changed']),
                    h.ul(
                      [],
                      [
                        h.li([], ['Tasks show their project and owner in every list.']),
                        h.li([], ['Invoices export as CSV from ', h.a([h.Href('#billing')], ['Billing']), '.']),
                        h.li(
                          [],
                          [
                            'Archived projects move to a separate tab:',
                            h.ul(
                              [],
                              [
                                h.li([], ['They keep their tasks and documents.']),
                                h.li([], ['Only owners can restore them.']),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    h.h3([], ['For admins']),
                    h.ol(
                      [],
                      [
                        h.li([], ['Open Settings › Members.']),
                        h.li([], ['Set the role to ', h.code([], ['billing']), ' for whoever sends invoices.']),
                      ],
                    ),
                    h.blockquote([], [h.p([], ['The digest replaced three separate emails for us. — Lena, Design'])]),
                    h.hr([]),
                    h.p([], ['Questions? Reply to this announcement and the team will get back to you.']),
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

const secondary = (h: HtmlBuilder<Message>): Html =>
  Prose.view(
    {
      className: 'max-w-md text-muted-foreground',
      children: [
        h.h2([], ['Version 2.4']),
        h.p([], ['Task lists load faster in large projects, and comments keep their formatting when you paste them.']),
        h.ul(
          [],
          [
            h.li([], ['Fixed: members invited by link appear at once.']),
            h.li([], ['Fixed: invoice totals round to the cent.']),
          ],
        ),
      ],
    },
    h,
  );

const editable = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Contenteditable('true'),
      h.Role('textbox'),
      h.Attribute('aria-multiline', 'true'),
      h.AriaLabel('Announcement'),
      h.Class(
        cn(
          inputSurfaceVariants({ scope: 'self' }),
          Prose.proseVariants(),
          'min-h-32 w-full max-w-md px-3 py-2 [--field-radius:var(--radius-area)]',
        ),
      ),
    ],
    [
      h.h2([], ['Office closed on Friday']),
      h.p([], ['The office is closed on ', h.strong([], ['Friday, May 9']), '. Tasks due that day move to Monday.']),
    ],
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'Rendered rich text (TipTap HTML, sanitized HTML, markdown) in the body role: h1 in heading, h2–h4 in body medium, lists, links, code, quotes and rules on the tokens, in both modes. Spacing is in em, so it follows the text size.',
      sections: [
        exampleSection({ title: 'Default', isBare: true, children: [announcement(h)] }, h),
        exampleSection(
          {
            title: 'Secondary',
            description: [code("className: 'text-muted-foreground'", h)],
            children: [secondary(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Rendered HTML',
            description: 'Sanitize first.',
            children: [Prose.view({ className: 'max-w-md', html: DOCUMENT_HTML }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Editable',
            description: [code('Prose.proseVariants()', h), ' on an editor’s editable element'],
            children: [editable(h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

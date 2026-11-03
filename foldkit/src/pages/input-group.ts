import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import { icon } from '../pavo/icon.ts';
import * as Input from '../pavo/input.ts';
import * as InputGroup from '../pavo/input-group.ts';
import * as Kbd from '../pavo/kbd.ts';
import * as Spinner from '../pavo/spinner.ts';

export const title = 'Input Group';
export const description = 'A field with text, icons, keys or buttons inside it.';

const COMMENT_LIMIT = 500;

export const Model = Schema.Struct({
  isApiKeyShown: Schema.Boolean,
  comment: Schema.String,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedShowApiKey: {},
  UpdatedComment: { value: Schema.String },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { isApiKeyShown: false, comment: 'The review moved to Thursday.' },
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedShowApiKey: () => ({
      model: modifyFields(model, { isApiKeyShown: (isApiKeyShown) => !isApiKeyShown }),
    }),
    UpdatedComment: ({ value }) => ({ model: modifyFields(model, { comment: () => value }) }),
  });

const withIcon = (h: HtmlBuilder<Message>): Html =>
  InputGroup.view(
    {
      className: 'w-80',
      children: [
        InputGroup.addon({ children: [icon('search')] }, h),
        InputGroup.input({ id: 'input-group-search', placeholder: 'Search members', ariaLabel: 'Search members' }, h),
      ],
    },
    h,
  );

const withText = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-wrap items-center gap-4')],
    [
      InputGroup.view(
        {
          className: 'w-72',
          children: [
            InputGroup.addon({ children: [InputGroup.text({ children: ['https://'] }, h)] }, h),
            InputGroup.input({ id: 'input-group-website', placeholder: 'example.com', ariaLabel: 'Website' }, h),
          ],
        },
        h,
      ),
      InputGroup.view(
        {
          className: 'w-40',
          children: [
            InputGroup.input(
              {
                id: 'input-group-terms',
                type: 'number',
                defaultValue: '30',
                ariaLabel: 'Payment terms',
                className: 'tabular-nums',
              },
              h,
            ),
            InputGroup.addon({ align: 'inline-end', children: [InputGroup.text({ children: ['days'] }, h)] }, h),
          ],
        },
        h,
      ),
    ],
  );

const withButton = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('grid w-96 gap-2')],
    [
      InputGroup.view(
        {
          children: [
            InputGroup.input(
              {
                id: 'input-group-api-key',
                type: model.isApiKeyShown ? 'text' : 'password',
                defaultValue: 'sk_live_123456',
                ariaLabel: 'API key',
              },
              h,
            ),
            InputGroup.addon(
              {
                align: 'inline-end',
                children: [
                  InputGroup.button(
                    {
                      size: 'icon-xs',
                      ariaLabel: model.isApiKeyShown ? 'Hide' : 'Show',
                      onClick: Message.ClickedShowApiKey(),
                      attributes: [h.AriaPressed(String(model.isApiKeyShown))],
                      children: [model.isApiKeyShown ? icon('eye-off') : icon('eye')],
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
      InputGroup.view(
        {
          children: [
            InputGroup.input(
              {
                id: 'input-group-invite-link',
                isReadOnly: true,
                defaultValue: 'https://example.com/invite/7f3a',
                ariaLabel: 'Invite link',
              },
              h,
            ),
            InputGroup.addon(
              { align: 'inline-end', children: [InputGroup.button({ children: [icon('copy'), 'Copy'] }, h)] },
              h,
            ),
          ],
        },
        h,
      ),
      InputGroup.view(
        {
          children: [
            InputGroup.input(
              { id: 'input-group-invite-email', type: 'email', placeholder: 'name@example.com', ariaLabel: 'Email' },
              h,
            ),
            InputGroup.addon(
              { align: 'inline-end', children: [InputGroup.button({ size: 'action', children: ['Invite'] }, h)] },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  );

const sideBySide = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-96 items-center gap-2')],
    [
      Input.view(
        { id: 'input-group-side-email', placeholder: 'name@example.com', ariaLabel: 'Email', className: 'flex-1' },
        h,
      ),
      Button.view({ type: 'button', children: ['Invite'] }, h),
    ],
  );

const blockAddon = (h: HtmlBuilder<Message>): Html =>
  InputGroup.view(
    {
      className: 'w-96',
      children: [
        InputGroup.textarea(
          { id: 'input-group-toolbar-comment', placeholder: 'Add a comment', ariaLabel: 'Comment' },
          h,
        ),
        InputGroup.addon(
          {
            align: 'block-end',
            className: 'border-t',
            children: [
              InputGroup.button({ size: 'icon-xs', ariaLabel: 'Bold', children: [icon('bold')] }, h),
              InputGroup.button({ size: 'icon-xs', ariaLabel: 'Italic', children: [icon('italic')] }, h),
              InputGroup.button({ size: 'icon-xs', ariaLabel: 'Link', children: [icon('link')] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const withShortcut = (h: HtmlBuilder<Message>): Html =>
  InputGroup.view(
    {
      className: 'w-80',
      children: [
        InputGroup.addon({ children: [icon('search')] }, h),
        InputGroup.input({ id: 'input-group-tasks', placeholder: 'Search tasks', ariaLabel: 'Search tasks' }, h),
        InputGroup.addon({ align: 'inline-end', children: [Kbd.view({ children: ['⌘K'] }, h)] }, h),
      ],
    },
    h,
  );

const pending = (h: HtmlBuilder<Message>): Html =>
  InputGroup.view(
    {
      className: 'w-80',
      children: [
        InputGroup.addon({ children: [icon('search')] }, h),
        InputGroup.input({ id: 'input-group-pending', defaultValue: 'Chen', ariaLabel: 'Search members' }, h),
        InputGroup.addon({ align: 'inline-end', children: [Spinner.view({ size: 16 })] }, h),
      ],
    },
    h,
  );

const withTextarea = (model: Model, h: HtmlBuilder<Message>): Html =>
  InputGroup.view(
    {
      className: 'w-96',
      children: [
        InputGroup.textarea(
          {
            id: 'input-group-comment',
            ariaLabel: 'Comment',
            value: model.comment,
            onInput: (value) => Message.UpdatedComment({ value }),
            attributes: [h.Maxlength(COMMENT_LIMIT)],
          },
          h,
        ),
        InputGroup.addon(
          {
            align: 'block-end',
            children: [
              InputGroup.text(
                {
                  className: 'ml-auto text-caption tabular-nums',
                  children: [`${model.comment.length} / ${COMMENT_LIMIT}`],
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

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A field with text, icons, keys or buttons inside it. The group owns the surface, focus and invalid; addons sit on the field’s 12px padding line.',
      sections: [
        exampleSection({ title: 'With icon', children: [withIcon(h)] }, h),
        exampleSection(
          {
            title: 'With text',
            description: [code('InputGroup.text', h), ': a prefix or a unit.'],
            children: [withText(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With button',
            description: [
              'An icon for a field-local toggle, text for a field-local action, ',
              code("size: 'action'", h),
              ' for a field that submits on its own.',
            ],
            children: [withButton(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Side by side',
            description:
              'Not a group: a field and a button, one related gap apart. For an action that is not about the field alone.',
            children: [sideBySide(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Block addon',
            description: [code("align: 'block-end'", h), ': a toolbar under the text.'],
            children: [blockAddon(h)],
          },
          h,
        ),
        exampleSection(
          { title: 'With shortcut', description: 'A Kbd in the end addon.', children: [withShortcut(h)] },
          h,
        ),
        exampleSection(
          { title: 'Pending', description: 'A Spinner in the end addon while results load.', children: [pending(h)] },
          h,
        ),
        exampleSection(
          {
            title: 'With textarea',
            description: [code('InputGroup.textarea', h), ', with a count below.'],
            children: [withTextarea(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

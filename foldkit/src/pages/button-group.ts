import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as ButtonGroup from '../pavo/button-group.ts';
import { icon } from '../pavo/icon.ts';

export const title = 'Button Group';
export const description = 'Buttons that act on one thing, joined.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedGroupButton: {},
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedGroupButton: () => ({ model }),
  });

const groupDefault = (h: HtmlBuilder<Message>): Html =>
  ButtonGroup.view(
    {
      children: [
        Button.view({ children: ['Preview'] }, h),
        Button.view({ children: ['Download'] }, h),
        Button.view({ size: 'icon', ariaLabel: 'More', children: [icon('chevron-down')] }, h),
      ],
    },
    h,
  );

const withSeparator = (h: HtmlBuilder<Message>): Html =>
  ButtonGroup.view(
    {
      children: [
        Button.view({ intent: 'primary', children: ['Publish'] }, h),
        ButtonGroup.separator({}, h),
        Button.view(
          { intent: 'primary', size: 'icon', ariaLabel: 'More publish options', children: [icon('chevron-down')] },
          h,
        ),
      ],
    },
    h,
  );

const vertical = (h: HtmlBuilder<Message>): Html =>
  ButtonGroup.view(
    {
      orientation: 'vertical',
      children: [
        Button.view({ children: ['Move up'] }, h),
        Button.view({ children: ['Move down'] }, h),
        Button.view({ children: ['Remove'] }, h),
      ],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'Buttons that act on one thing, joined: inner corners go square, the outer ends keep the buttons’ radius. A field with its own action is an Input Group, not a button group.',
      sections: [
        exampleSection({ title: 'Default', children: [groupDefault(h)] }, h),
        exampleSection(
          {
            title: 'With separator',
            description: ['A split button: solid buttons need ', code('ButtonGroup.separator', h), ' to read as two.'],
            children: [withSeparator(h)],
          },
          h,
        ),
        exampleSection(
          { title: 'Vertical', description: [code("orientation: 'vertical'", h)], children: [vertical(h)] },
          h,
        ),
      ],
    },
    h,
  ),
);

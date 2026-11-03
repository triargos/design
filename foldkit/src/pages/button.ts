import { Duration, Effect, Number, Schema } from 'effect';
import { Command, Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page, row } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import { icon } from '../pavo/icon.ts';

export const title = 'Button';
export const description = 'Runs an action: an intent at an emphasis, at a size.';

const FAST_REQUEST_LATENCY = Duration.millis(150);
const MIN_PENDING = Duration.millis(800);

export const Model = Schema.Struct({
  requestCount: Schema.Number,
  isFastRequestPending: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedFastRequest: {},
  CompletedSendFastRequest: {},
});
export type Message = typeof Message.Type;

const SendFastRequest = Command.define('SendFastRequest', {
  messages: [Message.CompletedSendFastRequest],
  execute: Effect.sleep(Duration.max(FAST_REQUEST_LATENCY, MIN_PENDING)).pipe(
    Effect.as(Message.CompletedSendFastRequest()),
  ),
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { requestCount: 0, isFastRequestPending: false },
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedFastRequest: () => ({
      model: modifyFields(model, {
        requestCount: Number.increment,
        isFastRequestPending: () => true,
      }),
      commands: [SendFastRequest()],
    }),
    CompletedSendFastRequest: () => ({
      model: modifyFields(model, { isFastRequestPending: () => false }),
    }),
  });

const intentAndEmphasis = (h: HtmlBuilder<Message>): Html =>
  row(
    [
      Button.view({ intent: 'primary', children: ['Create project'] }, h),
      Button.view({ children: ['Cancel'] }, h),
      Button.view({ emphasis: 'ghost', children: ['Skip'] }, h),
      Button.view({ intent: 'destructive', children: ['Delete forever'] }, h),
      Button.view({ intent: 'destructive', emphasis: 'subtle', children: ['Delete…'] }, h),
    ],
    h,
  );

const sizes = (h: HtmlBuilder<Message>): Html =>
  row(
    [
      Button.view({ size: 'xs', children: ['Edit'] }, h),
      Button.view({ size: 'sm', children: ['Edit'] }, h),
      Button.view({ children: ['Edit'] }, h),
      Button.view({ size: 'lg', children: ['Edit'] }, h),
    ],
    h,
  );

const withIcon = (h: HtmlBuilder<Message>): Html =>
  row(
    [
      Button.view({ intent: 'primary', children: [icon('plus', { dataIcon: 'inline-start' }), 'New task'] }, h),
      Button.view({ children: ['Next', icon('arrow-right', { dataIcon: 'inline-end' })] }, h),
    ],
    h,
  );

const iconOnly = (h: HtmlBuilder<Message>): Html =>
  row(
    [
      Button.view({ size: 'icon-sm', ariaLabel: 'More', children: [icon('dots')] }, h),
      Button.view({ size: 'icon', ariaLabel: 'More', children: [icon('dots')] }, h),
      Button.view({ size: 'icon-lg', ariaLabel: 'More', children: [icon('dots')] }, h),
    ],
    h,
  );

const open = (h: HtmlBuilder<Message>): Html =>
  row(
    [
      Button.view(
        {
          attributes: [h.AriaExpanded(true), h.AriaHasPopup('menu')],
          children: ['Options', icon('chevron-down', { dataIcon: 'inline-end' })],
        },
        h,
      ),
      Button.view(
        {
          emphasis: 'ghost',
          size: 'icon',
          ariaLabel: 'More',
          attributes: [h.AriaExpanded(true), h.AriaHasPopup('menu')],
          children: [icon('dots')],
        },
        h,
      ),
    ],
    h,
  );

const pending = (model: Model, h: HtmlBuilder<Message>): Html =>
  row(
    [
      Button.view({ intent: 'primary', isPending: true, children: ['Save'] }, h),
      Button.view(
        { intent: 'destructive', size: 'icon', isPending: true, ariaLabel: 'Delete', children: [icon('trash')] },
        h,
      ),
      Button.view(
        {
          isPending: model.isFastRequestPending,
          onClick: Message.ClickedFastRequest(),
          children: ['Fast request'],
        },
        h,
      ),
      h.span([h.Class('text-caption text-muted-foreground tabular-nums')], [`Requests sent: ${model.requestCount}`]),
    ],
    h,
  );

const disabled = (h: HtmlBuilder<Message>): Html =>
  row(
    [
      Button.view({ intent: 'primary', isDisabled: true, children: ['Save'] }, h),
      Button.view({ isDisabled: true, children: ['Cancel'] }, h),
      Button.view({ emphasis: 'ghost', isDisabled: true, children: ['Skip'] }, h),
    ],
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'An intent (what the action means) at an emphasis (how much it weighs), at a size (where it sits). Without props a button is neutral/raised, every ordinary action.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'No props: neutral/raised.',
            children: [Button.view({ children: ['Edit project'] }, h)],
          },
          h,
        ),
        exampleSection(
          { title: 'Intent and emphasis', description: 'The five pairs.', children: [intentAndEmphasis(h)] },
          h,
        ),
        exampleSection(
          {
            title: 'Sizes',
            description: '24 / 32 / 36 / 40px; the default is the field height.',
            children: [sizes(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With icon',
            description: [
              code("dataIcon: 'inline-start'", h),
              ' or ',
              code("'inline-end'", h),
              ' tightens the padding on that side.',
            ],
            children: [withIcon(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Icon only',
            description: [code('ariaLabel', h), ' names the action; the icon sizes match the text sizes.'],
            children: [iconOnly(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'As link',
            description: [code('href', h), ' renders an anchor with the button classes.'],
            children: [
              Button.view(
                { href: '#settings', children: ['Open settings', icon('arrow-right', { dataIcon: 'inline-end' })] },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Open',
            description: [code('aria-expanded', h), ' while the menu it opens is open.'],
            children: [open(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Pending',
            description: [
              code('isPending', h),
              ': the label keeps the width. The 800ms floor lives in the Command that clears it, not in the button.',
            ],
            children: [pending(model, h)],
          },
          h,
        ),
        exampleSection({ title: 'Disabled', children: [disabled(h)] }, h),
      ],
    },
    h,
  ),
);

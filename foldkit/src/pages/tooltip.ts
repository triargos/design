import { Array, Option, Schema } from 'effect';
import { Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { exampleSection, foundationSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import type * as Button from '../pavo/button.ts';
import type { Align, Side } from '../pavo/placement.ts';
import { icon } from '../pavo/icon.ts';
import * as Tooltip from '../pavo/tooltip.ts';

export const title = 'Tooltip';
export const description = 'A name for an icon-only control, after 200ms.';

const TooltipKey = Schema.Literals([
  'Default',
  'Top',
  'Right',
  'Bottom',
  'Left',
  'Start',
  'Center',
  'End',
  'Bold',
  'Italic',
  'InsertLink',
  'Copy',
  'Open',
]);
type TooltipKey = typeof TooltipKey.Type;

const GROUP_KEYS: ReadonlyArray<TooltipKey> = ['Bold', 'Italic', 'InsertLink', 'Copy'];

const isInGroup = (key: TooltipKey): boolean => Array.contains(GROUP_KEYS, key);

export const Model = Schema.Struct({
  tooltips: Schema.Record(TooltipKey, Tooltip.Model),
  toolbarGroup: Tooltip.DelayGroup,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotTooltipMessage: { key: TooltipKey, message: Tooltip.Message },
  GotToolbarGroupMessage: { message: Tooltip.DelayGroupMessage },
});
export type Message = typeof Message.Type;

const initTooltip = (key: TooltipKey): Tooltip.Model => Tooltip.init({ id: `tooltip-${key}` });

const initOpenTooltip = (key: TooltipKey): Tooltip.Model =>
  Tooltip.update(initTooltip(key), Tooltip.Message.FocusedTrigger()).model;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    tooltips: {
      Default: initTooltip('Default'),
      Top: initTooltip('Top'),
      Right: initTooltip('Right'),
      Bottom: initTooltip('Bottom'),
      Left: initTooltip('Left'),
      Start: initTooltip('Start'),
      Center: initTooltip('Center'),
      End: initTooltip('End'),
      Bold: initTooltip('Bold'),
      Italic: initTooltip('Italic'),
      InsertLink: initTooltip('InsertLink'),
      Copy: initTooltip('Copy'),
      Open: initOpenTooltip('Open'),
    },
    toolbarGroup: Tooltip.initDelayGroup(),
  },
});

const toTooltipMessage = (key: TooltipKey, message: Tooltip.Message): Message =>
  Message.GotTooltipMessage({ key, message });

const toToolbarGroupMessage = (message: Tooltip.DelayGroupMessage): Message =>
  Message.GotToolbarGroupMessage({ message });

const toolbarGroupFold = {
  read: (model: Model) => Option.some(model.toolbarGroup),
  write: (model: Model, nextToolbarGroup: Tooltip.DelayGroup) =>
    modifyFields(model, { toolbarGroup: () => nextToolbarGroup }),
  toParentMessage: toToolbarGroupMessage,
};

const foldToolbarGroup = Update.foldChild({ update: Tooltip.updateDelayGroup, ...toolbarGroupFold });
const foldToolbarGroupWarm = Update.foldChildStep({ update: Tooltip.warmDelayGroup, ...toolbarGroupFold });
const foldToolbarGroupCool = Update.foldChildStep({ update: Tooltip.coolDelayGroupLater, ...toolbarGroupFold });

const foldTooltipOutMessage = (key: TooltipKey) =>
  Tooltip.OutMessage.match<Update.Step<Model, Message>>({
    Shown: () => (stepModel) => (isInGroup(key) ? foldToolbarGroupWarm(stepModel) : { model: stepModel }),
    Hidden: () => (stepModel) => (isInGroup(key) ? foldToolbarGroupCool(stepModel) : { model: stepModel }),
  });

const writeTooltip = (model: Model, key: TooltipKey, nextTooltip: Tooltip.Model): Model =>
  modifyFields(model, { tooltips: (tooltips) => ({ ...tooltips, [key]: nextTooltip }) });

const foldTooltip = Update.foldChildAt({
  update: Tooltip.update,
  readAt: (model: Model, key: TooltipKey) => Option.some(model.tooltips[key]),
  writeAt: writeTooltip,
  toParentMessage: toTooltipMessage,
  foldOutMessage: foldTooltipOutMessage,
});

const withGroupDelay = (model: Model, key: TooltipKey): Model =>
  writeTooltip(model, key, Tooltip.reflectShowDelay(model.tooltips[key], Tooltip.showDelayIn(model.toolbarGroup)));

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotTooltipMessage: ({ key, message }) => {
      if (key === 'Open') {
        return { model };
      } else if (isInGroup(key) && message._tag === 'EnteredTrigger') {
        return foldTooltip(withGroupDelay(model, key), key, message);
      } else {
        return foldTooltip(model, key, message);
      }
    },
    GotToolbarGroupMessage: ({ message }) => foldToolbarGroup(model, message),
  });

type TooltipConfig = Readonly<{
  trigger: Button.ViewConfig<Message>;
  label: string;
  side?: Side;
  align?: Align;
}>;

const tooltip = (model: Model, key: TooltipKey, config: TooltipConfig, h: HtmlBuilder<Message>): Html =>
  Tooltip.view(
    {
      model: model.tooltips[key],
      toParentMessage: (message) => toTooltipMessage(key, message),
      trigger: config.trigger,
      content: [config.label],
      ...(config.side === undefined ? {} : { side: config.side }),
      ...(config.align === undefined ? {} : { align: config.align }),
    },
    h,
  );

const moreActions = (model: Model, key: TooltipKey, h: HtmlBuilder<Message>): Html =>
  tooltip(
    model,
    key,
    {
      trigger: { emphasis: 'ghost', size: 'icon', ariaLabel: 'More actions', children: [icon('dots')] },
      label: 'More actions',
    },
    h,
  );

const SIDES: ReadonlyArray<Readonly<{ key: TooltipKey; side: Side }>> = [
  { key: 'Top', side: 'top' },
  { key: 'Right', side: 'right' },
  { key: 'Bottom', side: 'bottom' },
  { key: 'Left', side: 'left' },
];

const ALIGNS: ReadonlyArray<Readonly<{ key: TooltipKey; align: Align }>> = [
  { key: 'Start', align: 'start' },
  { key: 'Center', align: 'center' },
  { key: 'End', align: 'end' },
];

const ACTIONS: ReadonlyArray<Readonly<{ key: TooltipKey; label: string; icon: Html }>> = [
  { key: 'Bold', label: 'Bold', icon: icon('bold') },
  { key: 'Italic', label: 'Italic', icon: icon('italic') },
  { key: 'InsertLink', label: 'Insert link', icon: icon('link') },
  { key: 'Copy', label: 'Copy', icon: icon('copy') },
];

const positionsExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-wrap items-center gap-2')],
    Array.map(SIDES, ({ key, side }) =>
      tooltip(model, key, { trigger: { children: [key] }, label: `Opens on the ${side}`, side }, h),
    ),
  );

const alignmentExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-wrap items-center gap-2')],
    Array.map(ALIGNS, ({ key, align }) =>
      tooltip(
        model,
        key,
        { trigger: { className: 'w-32', children: [key] }, label: `Aligned to the ${align}`, align },
        h,
      ),
    ),
  );

const delayGroupExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex items-center gap-0.5 text-muted-foreground')],
    Array.map(ACTIONS, ({ key, label, icon: actionIcon }) =>
      tooltip(
        model,
        key,
        { trigger: { emphasis: 'ghost', size: 'icon', ariaLabel: label, children: [actionIcon] }, label },
        h,
      ),
    ),
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A name for an icon-only control, after 200ms: a small popup. Opened by keyboard focus, it shows without animation.',
      sections: [
        exampleSection(
          { title: 'Default', description: 'Hover the button.', children: [moreActions(model, 'Default', h)] },
          h,
        ),
        exampleSection({ title: 'Positions', children: [positionsExample(model, h)] }, h),
        exampleSection({ title: 'Alignment', children: [alignmentExample(model, h)] }, h),
        exampleSection(
          {
            title: 'Delay group',
            description:
              'Icon-only buttons in one Tooltip.DelayGroup: the first tooltip opens after 200ms, its neighbours at once.',
            children: [delayGroupExample(model, h)],
          },
          h,
        ),
        foundationSection(
          {
            title: 'Open',
            description: 'Switch the mode and surface in the toolbar.',
            children: [
              h.div(
                [
                  h.DataAttribute('slot', 'preview'),
                  h.Class('flex h-28 items-end justify-center rounded-card border border-border p-card'),
                ],
                [moreActions(model, 'Open', h)],
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

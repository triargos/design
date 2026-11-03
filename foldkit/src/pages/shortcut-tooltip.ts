import { Array, Effect, Option, Record, Schema } from 'effect';
import { Command, Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import type * as Button from '../pavo/button.ts';
import { icon } from '../pavo/icon.ts';
import * as ShortcutTooltip from '../pavo/shortcut-tooltip.ts';
import * as Tooltip from '../pavo/tooltip.ts';

export const title = 'Shortcut Tooltip';
export const description = 'A control’s name and its keyboard shortcut in a tooltip.';

const TooltipKey = Schema.Literals(['NewTask', 'Search', 'Save', 'Export', 'Projects', 'Tasks', 'Members']);
type TooltipKey = typeof TooltipKey.Type;

const GROUP_KEYS: ReadonlyArray<TooltipKey> = ['Projects', 'Tasks', 'Members'];

const isInGroup = (key: TooltipKey): boolean => Array.contains(GROUP_KEYS, key);

export const Model = Schema.Struct({
  tooltips: Schema.Record(TooltipKey, Tooltip.Model),
  linksGroup: Tooltip.DelayGroup,
  isMac: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  CompletedDetectPlatform: { isMac: Schema.Boolean },
  GotTooltipMessage: { key: TooltipKey, message: Tooltip.Message },
  GotLinksGroupMessage: { message: Tooltip.DelayGroupMessage },
});
export type Message = typeof Message.Type;

const DetectPlatform = Command.define('DetectPlatform', {
  messages: [Message.CompletedDetectPlatform],
  execute: Effect.sync(() =>
    Message.CompletedDetectPlatform({
      isMac: ShortcutTooltip.isMacPlatform(navigator.platform || navigator.userAgent),
    }),
  ),
});

const initTooltip = (key: TooltipKey): Tooltip.Model => Tooltip.init({ id: `shortcut-tooltip-${key}` });

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    tooltips: {
      NewTask: initTooltip('NewTask'),
      Search: initTooltip('Search'),
      Save: initTooltip('Save'),
      Export: initTooltip('Export'),
      Projects: initTooltip('Projects'),
      Tasks: initTooltip('Tasks'),
      Members: initTooltip('Members'),
    },
    linksGroup: Tooltip.initDelayGroup(),
    isMac: false,
  },
  commands: [DetectPlatform()],
});

const toTooltipMessage = (key: TooltipKey, message: Tooltip.Message): Message =>
  Message.GotTooltipMessage({ key, message });

const linksGroupFold = {
  read: (model: Model) => Option.some(model.linksGroup),
  write: (model: Model, nextLinksGroup: Tooltip.DelayGroup) =>
    modifyFields(model, { linksGroup: () => nextLinksGroup }),
  toParentMessage: (message: Tooltip.DelayGroupMessage): Message => Message.GotLinksGroupMessage({ message }),
};

const foldLinksGroup = Update.foldChild({ update: Tooltip.updateDelayGroup, ...linksGroupFold });
const foldLinksGroupWarm = Update.foldChildStep({ update: Tooltip.warmDelayGroup, ...linksGroupFold });
const foldLinksGroupCool = Update.foldChildStep({ update: Tooltip.coolDelayGroupLater, ...linksGroupFold });

const foldTooltipOutMessage = (key: TooltipKey) =>
  Tooltip.OutMessage.match<Update.Step<Model, Message>>({
    Shown: () => (stepModel) =>
      isInGroup(key) ? foldLinksGroupWarm(cutOtherGroupLeaves(stepModel, key)) : { model: stepModel },
    Hidden: () => (stepModel) => (isInGroup(key) ? foldLinksGroupCool(stepModel) : { model: stepModel }),
  });

const writeTooltip = (model: Model, key: TooltipKey, nextTooltip: Tooltip.Model): Model =>
  modifyFields(model, { tooltips: Record.set(key, nextTooltip) });

const foldTooltip = Update.foldChildAt({
  update: Tooltip.update,
  readAt: (model: Model, key: TooltipKey) => Option.some(model.tooltips[key]),
  writeAt: writeTooltip,
  toParentMessage: toTooltipMessage,
  foldOutMessage: foldTooltipOutMessage,
});

const withGroupDelay = (model: Model, key: TooltipKey): Model =>
  writeTooltip(model, key, Tooltip.reflectDelayGroup(model.tooltips[key], model.linksGroup));

const cutOtherGroupLeaves = (model: Model, shownKey: TooltipKey): Model =>
  Array.reduce(
    Array.filter(GROUP_KEYS, (key) => key !== shownKey),
    model,
    (stepModel, key) => writeTooltip(stepModel, key, Tooltip.cutLeave(stepModel.tooltips[key])),
  );

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    CompletedDetectPlatform: ({ isMac }) => ({ model: modifyFields(model, { isMac: () => isMac }) }),
    GotTooltipMessage: ({ key, message }) =>
      isInGroup(key) && Tooltip.isEnteredTrigger(message)
        ? foldTooltip(withGroupDelay(model, key), key, message)
        : foldTooltip(model, key, message),
    GotLinksGroupMessage: ({ message }) => foldLinksGroup(model, message),
  });

const shortcutTooltip = (
  model: Model,
  key: TooltipKey,
  label: string,
  shortcut: ReadonlyArray<string>,
  trigger: Button.ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  ShortcutTooltip.view(
    {
      model: model.tooltips[key],
      toParentMessage: (message) => toTooltipMessage(key, message),
      isMac: model.isMac,
      label,
      shortcut,
      trigger,
    },
    h,
  );

const LINKS: ReadonlyArray<Readonly<{ key: TooltipKey; label: string; shortcut: ReadonlyArray<string>; icon: Html }>> =
  [
    { key: 'Projects', label: 'Projects', shortcut: ['G', 'P'], icon: icon('folder') },
    { key: 'Tasks', label: 'Tasks', shortcut: ['G', 'T'], icon: icon('checklist') },
    { key: 'Members', label: 'Members', shortcut: ['G', 'M'], icon: icon('users') },
  ];

const combinationExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex items-center gap-2')],
    [
      shortcutTooltip(
        model,
        'Search',
        'Search',
        ['$mod+K'],
        { emphasis: 'ghost', size: 'icon', ariaLabel: 'Search', children: [icon('search')] },
        h,
      ),
      shortcutTooltip(model, 'Save', 'Save invoice', ['$mod+Enter'], { intent: 'primary', children: ['Save'] }, h),
      shortcutTooltip(model, 'Export', 'Export tasks', ['$mod+Shift+E'], { children: ['Export'] }, h),
    ],
  );

const chordExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex items-center gap-0.5 text-muted-foreground')],
    Array.map(LINKS, (link) =>
      shortcutTooltip(
        model,
        link.key,
        link.label,
        link.shortcut,
        { emphasis: 'ghost', size: 'icon', ariaLabel: link.label, children: [link.icon] },
        h,
      ),
    ),
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'A control’s name and its keyboard shortcut in a tooltip, the keys as Kbds. $mod prints ⌘ on a Mac and Ctrl elsewhere; the page starts with Ctrl and a Mac switches once its init Command reads the platform. The keys are hidden from screen readers.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('label', h), ' + ', code('shortcut', h), ', the control as the trigger'],
            children: [
              shortcutTooltip(model, 'NewTask', 'New task', ['C'], { intent: 'primary', children: ['New task'] }, h),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Combination',
            description: [code("['$mod+Enter']", h), ': keys pressed together'],
            children: [combinationExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Chord',
            description: [code("['G', 'P']", h), ': one step after the other; ', code('thenLabel', h), ' joins them'],
            children: [chordExample(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

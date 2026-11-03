import { Array, Duration, Effect, Schema } from 'effect';
import { Command, Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { defineTaggedUnion } from 'foldkit/schema';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import * as FadeIn from '../pavo/fade-in.ts';
import { icon } from '../pavo/icon.ts';
import * as Item from '../pavo/item.ts';
import * as Skeleton from '../pavo/skeleton.ts';

export const title = 'Fade In';
export const description = 'Content that arrives after a load fades in.';

type Task = Readonly<{ id: string; title: string; project: string }>;

const TASKS: ReadonlyArray<Task> = [
  { id: 'brief', title: 'Write the launch brief', project: 'Website relaunch' },
  { id: 'invoices', title: 'Send March invoices', project: 'Finance' },
  { id: 'onboarding', title: 'Onboard Priya', project: 'Team' },
];

const MEMBERS: ReadonlyArray<string> = ['Jordan Lee', 'Sam Rivera', 'Priya Nair', 'Lena Park'];

const TASKS_LATENCY = Duration.millis(1200);
const MEMBERS_LATENCY = Duration.millis(1000);

const MembersLoad = defineTaggedUnion({
  NotLoaded: {},
  Loading: {},
  Loaded: { isFadingIn: Schema.Boolean },
});

export const Model = Schema.Struct({
  isLoadingTasks: Schema.Boolean,
  isMembersOpen: Schema.Boolean,
  membersLoad: MembersLoad,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedReloadTasks: {},
  CompletedLoadTasks: {},
  ClickedToggleMembers: {},
  CompletedLoadMembers: {},
});
export type Message = typeof Message.Type;

const LoadTasks = Command.define('LoadTasks', {
  messages: [Message.CompletedLoadTasks],
  execute: Effect.sleep(TASKS_LATENCY).pipe(Effect.as(Message.CompletedLoadTasks())),
});

const LoadMembers = Command.define('LoadMembers', {
  messages: [Message.CompletedLoadMembers],
  execute: Effect.sleep(MEMBERS_LATENCY).pipe(Effect.as(Message.CompletedLoadMembers())),
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: { isLoadingTasks: true, isMembersOpen: false, membersLoad: MembersLoad.NotLoaded() },
  commands: [LoadTasks()],
});

const openMembers = (model: Model): Update.Return<Model, Message> =>
  MembersLoad.match<Update.Return<Model, Message>>(model.membersLoad, {
    NotLoaded: () => ({
      model: modifyFields(model, { isMembersOpen: () => true, membersLoad: () => MembersLoad.Loading() }),
      commands: [LoadMembers()],
    }),
    Loading: () => ({ model: modifyFields(model, { isMembersOpen: () => true }) }),
    Loaded: () => ({
      model: modifyFields(model, {
        isMembersOpen: () => true,
        membersLoad: () => MembersLoad.Loaded({ isFadingIn: false }),
      }),
    }),
  });

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedReloadTasks: () => ({
      model: modifyFields(model, { isLoadingTasks: () => true }),
      commands: [LoadTasks()],
    }),
    CompletedLoadTasks: () => ({ model: modifyFields(model, { isLoadingTasks: () => false }) }),
    ClickedToggleMembers: () =>
      model.isMembersOpen ? { model: modifyFields(model, { isMembersOpen: () => false }) } : openMembers(model),
    CompletedLoadMembers: () => ({
      model: modifyFields(model, { membersLoad: () => MembersLoad.Loaded({ isFadingIn: true }) }),
    }),
  });

const taskSkeleton = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col gap-group p-card')],
    Array.map(TASKS, (task) =>
      h.div(
        [h.Key(task.id), h.Class('flex flex-col gap-2')],
        [Skeleton.view({ className: 'h-3.5 w-2/5' }, h), Skeleton.view({ className: 'h-3 w-1/4' }, h)],
      ),
    ),
  );

const taskList = (h: HtmlBuilder<Message>): Html =>
  FadeIn.view(
    {
      children: [
        Item.list(
          {
            children: Array.map(TASKS, (task) =>
              Item.view(
                {
                  attributes: [h.Key(task.id)],
                  children: [
                    Item.content(
                      {
                        children: [
                          Item.title({ children: [task.title] }, h),
                          Item.description({ children: [task.project] }, h),
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
  );

const defaultExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-md',
      children: [
        Card.header(
          {
            actions: [
              Button.view(
                {
                  size: 'sm',
                  isDisabled: model.isLoadingTasks,
                  onClick: Message.ClickedReloadTasks(),
                  children: [icon('refresh', { dataIcon: 'inline-start' }), 'Reload'],
                },
                h,
              ),
            ],
            children: [Card.title({ children: ['My tasks'] }, h)],
          },
          h,
        ),
        Card.content(
          { className: 'overflow-hidden', children: [model.isLoadingTasks ? taskSkeleton(h) : taskList(h)] },
          h,
        ),
      ],
    },
    h,
  );

const memberSkeleton = (h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col gap-2')],
    Array.map(MEMBERS, (name) => Skeleton.view({ className: 'h-3.5 w-32', attributes: [h.Key(name)] }, h)),
  );

const memberList = (isFadingIn: boolean, h: HtmlBuilder<Message>): Html =>
  FadeIn.view(
    {
      element: 'ul',
      isAnimated: isFadingIn,
      className: 'flex flex-col gap-0.5 text-body',
      children: Array.map(MEMBERS, (name) => h.li([h.Key(name)], [name])),
    },
    h,
  );

const members = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> =>
  model.isMembersOpen
    ? [
        MembersLoad.match<Html>(model.membersLoad, {
          NotLoaded: () => memberSkeleton(h),
          Loading: () => memberSkeleton(h),
          Loaded: ({ isFadingIn }) => memberList(isFadingIn, h),
        }),
      ]
    : [];

const firstLoadOnlyExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-64 flex-col gap-group')],
    [
      Button.view(
        {
          className: 'self-start',
          onClick: Message.ClickedToggleMembers(),
          children: [model.isMembersOpen ? 'Hide members' : 'Show members'],
        },
        h,
      ),
      h.div([h.Class('min-h-28')], members(model, h)),
    ],
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'Content that arrives after a load fades in over duration-feedback, opacity only. Content that was there from the first render shows at once.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: [code('FadeIn.view', h), ' in place of the skeleton'],
            children: [defaultExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'First load only',
            description: [
              'The Model records how the data arrived: ',
              code('Loaded({ isFadingIn })', h),
              ' → ',
              code('isAnimated', h),
              ': cached data does not fade',
            ],
            children: [firstLoadOnlyExample(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);

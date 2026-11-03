import { Array, Option, Schema } from 'effect';
import { Submodel, Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Badge from '../pavo/badge.ts';
import * as Card from '../pavo/card.ts';
import { icon } from '../pavo/icon.ts';
import * as Sidebar from '../pavo/sidebar.ts';

export const title = 'Sidebar';
export const description = 'The app navigation: the sidebar on the shell, the page panel beside it.';

type SidebarLink = Readonly<{
  label: string;
  icon: Html;
  isCurrent: boolean;
  count?: number;
  children?: ReadonlyArray<string>;
}>;

type SidebarGroup = Readonly<{ title: string; links: ReadonlyArray<SidebarLink> }>;

const GROUPS: ReadonlyArray<SidebarGroup> = [
  {
    title: 'Workspace',
    links: [
      { label: 'Overview', icon: icon('home'), isCurrent: false },
      { label: 'Inbox', icon: icon('inbox'), isCurrent: false, count: 3 },
      { label: 'Tasks', icon: icon('square-check'), isCurrent: true },
      { label: 'Projects', icon: icon('folder'), isCurrent: false, children: ['Website redesign', 'Mobile app'] },
    ],
  },
  {
    title: 'Admin',
    links: [
      { label: 'Members', icon: icon('users'), isCurrent: false },
      { label: 'Settings', icon: icon('settings'), isCurrent: false },
    ],
  },
];

export const Model = Schema.Struct({
  defaultSidebar: Sidebar.Model,
  collapsedSidebar: Sidebar.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotDefaultSidebarMessage: { message: Sidebar.Message },
  GotCollapsedSidebarMessage: { message: Sidebar.Message },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    defaultSidebar: Sidebar.init({ id: 'sidebar-default' }),
    collapsedSidebar: Sidebar.init({ id: 'sidebar-collapsed', isOpen: false }),
  },
});

const toDefaultSidebarMessage = (message: Sidebar.Message): Message => Message.GotDefaultSidebarMessage({ message });
const toCollapsedSidebarMessage = (message: Sidebar.Message): Message =>
  Message.GotCollapsedSidebarMessage({ message });

const foldDefaultSidebar = Update.foldChild({
  update: Sidebar.update,
  read: (model: Model) => Option.some(model.defaultSidebar),
  write: (model: Model, nextDefaultSidebar: Sidebar.Model) =>
    modifyFields(model, { defaultSidebar: () => nextDefaultSidebar }),
  toParentMessage: toDefaultSidebarMessage,
});

const foldCollapsedSidebar = Update.foldChild({
  update: Sidebar.update,
  read: (model: Model) => Option.some(model.collapsedSidebar),
  write: (model: Model, nextCollapsedSidebar: Sidebar.Model) =>
    modifyFields(model, { collapsedSidebar: () => nextCollapsedSidebar }),
  toParentMessage: toCollapsedSidebarMessage,
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    GotDefaultSidebarMessage: ({ message }) => foldDefaultSidebar(model, message),
    GotCollapsedSidebarMessage: ({ message }) => foldCollapsedSidebar(model, message),
  });

export const subscriptions = Subscription.aggregate(
  Subscription.lift({
    sidebarDefaultViewport: Sidebar.subscriptions.viewport,
    sidebarDefaultToggleShortcut: Sidebar.subscriptions.toggleShortcut,
  })<Model, Message>({
    read: (model) => Option.some(model.defaultSidebar),
    toParentMessage: toDefaultSidebarMessage,
  }),
  Subscription.lift({
    sidebarCollapsedViewport: Sidebar.subscriptions.viewport,
    sidebarCollapsedToggleShortcut: Sidebar.subscriptions.toggleShortcut,
  })<Model, Message>({
    read: (model) => Option.some(model.collapsedSidebar),
    toParentMessage: toCollapsedSidebarMessage,
  }),
);

type AppFrameConfig = Readonly<{
  model: Sidebar.Model;
  toSidebarMessage: (message: Sidebar.Message) => Message;
  isIconCollapsible: boolean;
}>;

const linkView = (
  link: SidebarLink,
  toSidebarMessage: (message: Sidebar.Message) => Message,
  h: HtmlBuilder<Message>,
): Html =>
  Sidebar.menuItem(
    {
      attributes: [h.Key(link.label)],
      children: [
        Sidebar.menuButton(
          {
            isCurrent: link.isCurrent,
            className: 'relative w-full gap-3',
            onClick: toSidebarMessage(Sidebar.Message.ClickedMenuLink()),
            children: [
              link.icon,
              h.span([], [link.label]),
              ...(link.count === undefined
                ? []
                : [
                    Badge.view(
                      {
                        size: 'sm',
                        shape: 'pill',
                        className: 'absolute right-2 min-w-5 tabular-nums',
                        children: [String(link.count)],
                      },
                      h,
                    ),
                  ]),
            ],
          },
          h,
        ),
        ...(link.children === undefined
          ? []
          : [
              Sidebar.menuSub(
                {
                  children: Array.map(link.children, (child, index) =>
                    Sidebar.menuSubItem(
                      {
                        attributes: [h.Key(child)],
                        children: [
                          Sidebar.menuSubButton(
                            {
                              isCurrent: index === 0,
                              onClick: toSidebarMessage(Sidebar.Message.ClickedMenuLink()),
                              children: [h.span([], [child])],
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
            ]),
      ],
    },
    h,
  );

const appFrame = ({ model, toSidebarMessage, isIconCollapsible }: AppFrameConfig, h: HtmlBuilder<Message>): Html => {
  const iconPadding = isIconCollapsible ? 'group-data-[collapsible=icon]:px-2' : '';
  return h.div(
    [h.Class('relative h-[600px] w-full overflow-hidden rounded-panel bg-sidebar')],
    [
      Sidebar.provider(
        {
          className: 'h-full',
          children: [
            h.div(
              [h.Class('flex h-full min-h-0 w-full md:pt-3 md:pr-3 md:pb-3')],
              [
                Sidebar.view(
                  {
                    model,
                    toParentMessage: toSidebarMessage,
                    collapsible: isIconCollapsible ? 'icon' : 'offcanvas',
                    children: [
                      Sidebar.header(
                        {
                          className: `px-5 pt-group ${iconPadding}`,
                          children: [
                            h.div(
                              [h.Class('flex items-center gap-2')],
                              [
                                h.span(
                                  [
                                    h.Class(
                                      'flex size-8 shrink-0 items-center justify-center rounded-control-sm bg-primary-solid text-caption font-medium text-primary-solid-foreground',
                                    ),
                                  ],
                                  ['AC'],
                                ),
                                h.span([h.Class('truncate text-body font-medium')], ['Acme Inc.']),
                              ],
                            ),
                          ],
                        },
                        h,
                      ),
                      Sidebar.content(
                        {
                          children: Array.map(GROUPS, (group) =>
                            Sidebar.group(
                              {
                                className: `px-5 ${iconPadding}`,
                                attributes: [h.Key(group.title)],
                                children: [
                                  Sidebar.groupLabel({ children: [group.title] }, h),
                                  Sidebar.groupContent(
                                    {
                                      children: [
                                        Sidebar.menu(
                                          {
                                            children: Array.map(group.links, (link) =>
                                              linkView(link, toSidebarMessage, h),
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
                            ),
                          ),
                        },
                        h,
                      ),
                      Sidebar.footer(
                        {
                          className: `px-5 pb-group ${iconPadding}`,
                          children: [
                            h.span(
                              [
                                h.Class(
                                  `truncate text-caption text-muted-foreground ${isIconCollapsible ? 'group-data-[collapsible=icon]:hidden' : ''}`,
                                ),
                              ],
                              ['Jordan Lee · Admin'],
                            ),
                          ],
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                h.div(
                  [
                    h.Class(
                      'relative h-full min-w-0 flex-1 overflow-y-auto bg-background shadow-md ring ring-border/50 md:rounded-panel',
                    ),
                  ],
                  [
                    h.div(
                      [h.Class('absolute top-3 left-3')],
                      [Sidebar.trigger({ model, toParentMessage: toSidebarMessage }, h)],
                    ),
                    h.div(
                      [h.Class('px-5 pt-10 pb-28 md:px-10')],
                      [
                        h.div(
                          [h.Class('flex flex-col gap-page')],
                          [
                            h.hgroup(
                              [h.Class('flex flex-col gap-tight')],
                              [
                                h.h1([h.Class('text-title text-balance')], ['Tasks']),
                                h.p(
                                  [h.Class('text-body text-pretty text-muted-foreground')],
                                  ['Everything assigned to you this week.'],
                                ),
                              ],
                            ),
                            Card.view(
                              {
                                children: [
                                  Card.header({ children: [Card.title({ children: ['Due today'] }, h)] }, h),
                                  Card.content({ className: 'h-24' }, h),
                                ],
                              },
                              h,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ],
        },
        h,
      ),
    ],
  );
};

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description: 'The app navigation: the sidebar on the shell, the page panel beside it.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            isBare: true,
            children: [
              appFrame(
                { model: model.defaultSidebar, toSidebarMessage: toDefaultSidebarMessage, isIconCollapsible: false },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Collapsed',
            description: [
              code("collapsible: 'icon'", h),
              ", closed: icons only. The trigger toggles it; ⌘[ toggles the app's own sidebar.",
            ],
            isBare: true,
            children: [
              appFrame(
                {
                  model: model.collapsedSidebar,
                  toSidebarMessage: toCollapsedSidebarMessage,
                  isIconCollapsible: true,
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
);

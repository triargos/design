import { BrowserKeyValueStore } from '@effect/platform-browser';
import { Array, Effect, Match, Option, Schema, Stream } from 'effect';
import { KeyValueStore } from 'effect/persistence';
import { Calendar, Command, Dom, Runtime, Subscription, Update } from 'foldkit';
import type { Document, Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { UrlRequest, load, pushUrl } from 'foldkit/navigation';
import { modifyFields } from 'foldkit/struct';
import { Url, toString as urlToString } from 'foldkit/url';

import * as Customize from './customize.ts';
import { proschuleLogo } from './logo.ts';
import * as Pages from './pages.generated.ts';
import * as Sidebar from './pavo/sidebar.ts';
import * as Tabs from './pavo/tabs.ts';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const THEME_STORAGE_KEY = 'pavo-foldkit-theme';

const ResolvedTheme = Schema.Literals(['Light', 'Dark']);
type ResolvedTheme = typeof ResolvedTheme.Type;

const ThemePreference = Schema.Literals(['System', 'Light', 'Dark']);
type ThemePreference = typeof ThemePreference.Type;

const THEME_LABELS: Record<ThemePreference, string> = { System: 'System', Light: 'Light', Dark: 'Dark' };

export const Model = Schema.Struct({
  route: Pages.AppRoute,
  themePreference: ThemePreference,
  systemTheme: ResolvedTheme,
  customize: Customize.Model,
  sidebar: Sidebar.Model,
  pages: Pages.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  CompletedNavigateInternal: {},
  CompletedLoadExternal: {},
  CompletedApplyTheme: {},
  CompletedSaveThemePreference: {},
  ClickedLink: { request: UrlRequest },
  ChangedUrl: { url: Url },
  UpdatedThemePreference: { themePreference: ThemePreference },
  UpdatedSystemTheme: { systemTheme: ResolvedTheme },
  GotCustomizeMessage: { message: Customize.Message },
  ClickedNavLink: {},
  GotSidebarMessage: { message: Sidebar.Message },
  GotPagesMessage: { message: Pages.Message },
});
export type Message = typeof Message.Type;

const resolveTheme = (themePreference: ThemePreference, systemTheme: ResolvedTheme): ResolvedTheme =>
  Match.value(themePreference).pipe(
    Match.withReturnType<ResolvedTheme>(),
    Match.when('System', () => systemTheme),
    Match.when('Light', () => 'Light'),
    Match.when('Dark', () => 'Dark'),
    Match.exhaustive,
  );

const NavigateInternal = Command.define('NavigateInternal', {
  args: { url: Schema.String },
  messages: [Message.CompletedNavigateInternal],
  execute: ({ url }) => pushUrl(url).pipe(Effect.as(Message.CompletedNavigateInternal())),
});

const LoadExternal = Command.define('LoadExternal', {
  args: { href: Schema.String },
  messages: [Message.CompletedLoadExternal],
  execute: ({ href }) => load(href).pipe(Effect.as(Message.CompletedLoadExternal())),
});

const ApplyTheme = Command.define('ApplyTheme', {
  args: { theme: ResolvedTheme },
  messages: [Message.CompletedApplyTheme],
  execute: ({ theme }) =>
    Effect.sync(() => {
      const isDark = theme === 'Dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      return Message.CompletedApplyTheme();
    }),
});

const ThemePreferenceJson = Schema.fromJsonString(ThemePreference);

const SaveThemePreference = Command.define('SaveThemePreference', {
  args: { themePreference: ThemePreference },
  messages: [Message.CompletedSaveThemePreference],
  execute: ({ themePreference }) =>
    Effect.gen(function* () {
      const store = yield* KeyValueStore.KeyValueStore;
      if (themePreference === 'System') {
        yield* store.remove(THEME_STORAGE_KEY);
      } else {
        yield* store.set(THEME_STORAGE_KEY, yield* Schema.encodeEffect(ThemePreferenceJson)(themePreference));
      }
      return Message.CompletedSaveThemePreference();
    }).pipe(
      Effect.catch(() => Effect.succeed(Message.CompletedSaveThemePreference())),
      Effect.provide(BrowserKeyValueStore.layerLocalStorage),
    ),
});

export const Flags = Schema.Struct({
  today: Calendar.CalendarDate,
  systemTheme: ResolvedTheme,
  themePreference: ThemePreference,
  customization: Customize.Customization,
});
export type Flags = typeof Flags.Type;

const loadThemePreference: Effect.Effect<ThemePreference> = Effect.gen(function* () {
  const store = yield* KeyValueStore.KeyValueStore;
  const json = yield* Effect.fromOption(Option.fromNullishOr(yield* store.get(THEME_STORAGE_KEY)));
  return yield* Schema.decodeEffect(ThemePreferenceJson)(json);
}).pipe(
  Effect.catch(() => Effect.succeed<ThemePreference>('System')),
  Effect.provide(BrowserKeyValueStore.layerLocalStorage),
);

export const flags: Effect.Effect<Flags> = Effect.gen(function* () {
  const today = yield* Calendar.today.local;
  const isDark = yield* Effect.sync(() => window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches);
  const themePreference = yield* loadThemePreference;
  const customization = yield* Customize.loadCustomization;
  return { today, systemTheme: isDark ? 'Dark' : 'Light', themePreference, customization };
});

export const init: Runtime.RoutingApplicationInit<Model, Message, Flags> = (flags, url) =>
  Update.foldChildInit(Pages.init({ today: flags.today }), {
    toParentModel: (pages) => ({
      route: Pages.urlToAppRoute(url),
      themePreference: flags.themePreference,
      systemTheme: flags.systemTheme,
      customize: Customize.init(flags.customization),
      sidebar: Sidebar.init({ id: 'docs-sidebar', isShortcutBound: true }),
      pages,
    }),
    toParentMessage: (message) => Message.GotPagesMessage({ message }),
  });

const foldPages = Update.foldChild({
  update: Pages.update,
  read: (model: Model) => Option.some(model.pages),
  write: (model, nextPages) => modifyFields(model, { pages: () => nextPages }),
  toParentMessage: (message) => Message.GotPagesMessage({ message }),
});

const foldCustomize = Update.foldChild({
  update: Customize.update,
  read: (model: Model) => Option.some(model.customize),
  write: (model, nextCustomize) => modifyFields(model, { customize: () => nextCustomize }),
  toParentMessage: (message) => Message.GotCustomizeMessage({ message }),
});

const toSidebarMessage = (message: Sidebar.Message): Message => Message.GotSidebarMessage({ message });

const sidebarFold = {
  read: (model: Model) => Option.some(model.sidebar),
  write: (model: Model, nextSidebar: Sidebar.Model) => modifyFields(model, { sidebar: () => nextSidebar }),
  toParentMessage: toSidebarMessage,
};

const foldSidebar = Update.foldChild({ update: Sidebar.update, ...sidebarFold });
const foldSidebarCloseMobile = Update.foldChildStep({ update: Sidebar.closeMobile, ...sidebarFold });

type UpdateReturn = Update.Return<Model, Message>;

const applyThemeChange = (model: Model, nextModel: Model): UpdateReturn => {
  const theme = resolveTheme(model.themePreference, model.systemTheme);
  const nextTheme = resolveTheme(nextModel.themePreference, nextModel.systemTheme);
  return { model: nextModel, commands: theme === nextTheme ? [] : [ApplyTheme({ theme: nextTheme })] };
};

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    CompletedNavigateInternal: () => ({ model }),
    CompletedLoadExternal: () => ({ model }),
    CompletedApplyTheme: () => ({ model }),
    CompletedSaveThemePreference: () => ({ model }),
    ClickedLink: ({ request }) =>
      UrlRequest.match<UpdateReturn>(request, {
        Internal: ({ url }) => ({ model, commands: [NavigateInternal({ url: urlToString(url) })] }),
        External: ({ href }) => ({ model, commands: [LoadExternal({ href })] }),
      }),
    ChangedUrl: ({ url }) => ({ model: modifyFields(model, { route: () => Pages.urlToAppRoute(url) }) }),
    UpdatedThemePreference: ({ themePreference }) => {
      const themeChange = applyThemeChange(model, modifyFields(model, { themePreference: () => themePreference }));
      return {
        model: themeChange.model,
        commands: [...(themeChange.commands ?? []), SaveThemePreference({ themePreference })],
      };
    },
    UpdatedSystemTheme: ({ systemTheme }) =>
      applyThemeChange(model, modifyFields(model, { systemTheme: () => systemTheme })),
    GotCustomizeMessage: ({ message }) => foldCustomize(model, message),
    ClickedNavLink: () => foldSidebarCloseMobile(model),
    GotSidebarMessage: ({ message }) => foldSidebar(model, message),
    GotPagesMessage: ({ message }) => foldPages(model, message),
  });

const isThemePreference = Schema.is(ThemePreference);

const navLink = (title: string, href: string, isCurrent: boolean, h: HtmlBuilder<Message>): Html =>
  Sidebar.menuItem(
    {
      attributes: [h.Key(href)],
      children: [
        Sidebar.menuButton(
          {
            href,
            isCurrent,
            onClick: Message.ClickedNavLink(),
            children: [title],
          },
          h,
        ),
      ],
    },
    h,
  );

const wordmark = (h: HtmlBuilder<Message>): Html =>
  h.a(
    [
      h.Href(Pages.homeHref),
      h.Class('flex items-center gap-2 rounded-control-sm text-body font-medium text-sidebar-foreground'),
    ],
    [proschuleLogo(), 'Pavo', h.span([h.Class('font-normal text-muted-foreground')], ['· Foldkit'])],
  );

const themePicker = (model: Model, h: HtmlBuilder<Message>): Html =>
  Tabs.radioGroup(
    {
      variant: 'segmented',
      ariaLabel: 'Theme',
      value: model.themePreference,
      onValueChange: (value) =>
        Message.UpdatedThemePreference({ themePreference: isThemePreference(value) ? value : model.themePreference }),
      className: 'w-full',
      radios: Array.map(ThemePreference.literals, (themePreference) => ({
        value: themePreference,
        className: 'flex-1',
        children: [THEME_LABELS[themePreference]],
      })),
    },
    h,
  );

const sidebar = (model: Model, h: HtmlBuilder<Message>): Html =>
  Sidebar.view(
    {
      model: model.sidebar,
      toParentMessage: toSidebarMessage,
      children: [
        Sidebar.header({ className: 'px-3 pt-group', children: [h.header([h.Class('px-2')], [wordmark(h)])] }, h),
        Sidebar.content(
          {
            className: 'px-1',
            children: [
              h.nav(
                [h.AriaLabel('Pages'), h.Class('flex flex-col gap-2')],
                [
                  Sidebar.group(
                    {
                      children: [
                        Sidebar.menu(
                          { children: [navLink('Introduction', Pages.homeHref, model.route._tag === 'Home', h)] },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                  Sidebar.group(
                    {
                      children: [
                        Sidebar.groupLabel({ children: [h.h2([], ['Components'])] }, h),
                        Sidebar.groupContent(
                          {
                            children: [
                              Sidebar.menu(
                                {
                                  children: Array.map(Pages.NAV_ITEMS, (item) =>
                                    navLink(item.title, item.href, item.routeTag === model.route._tag, h),
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
                ],
              ),
            ],
          },
          h,
        ),
        Sidebar.footer(
          {
            className: 'px-3 pb-group',
            children: [h.footer([h.Class('flex flex-col gap-related')], [themePicker(model, h)])],
          },
          h,
        ),
      ],
    },
    h,
  );

const routeTitle = (route: Pages.AppRoute): string =>
  Option.match(
    Array.findFirst(Pages.NAV_ITEMS, (item) => item.routeTag === route._tag),
    { onNone: () => 'Pavo · Foldkit', onSome: (item) => `${item.title} · Pavo · Foldkit` },
  );

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: routeTitle(model.route),
  body: h.div(
    [],
    [
      ...Array.map(Customize.customizationCss(model.customize.customization), (css) => h.style([], [css])),
      Sidebar.provider(
        {
          children: [
            h.div(
              [h.Class('relative flex h-dvh w-screen flex-col bg-sidebar font-sans antialiased')],
              [
                h.header(
                  [h.Class('flex h-14 shrink-0 items-center gap-related px-3 md:hidden')],
                  [Sidebar.trigger({ model: model.sidebar, toParentMessage: toSidebarMessage }, h), wordmark(h)],
                ),
                h.div(
                  [h.Class('flex h-full min-h-0 shrink md:py-3 md:pe-3')],
                  [
                    sidebar(model, h),
                    h.div(
                      [h.Class('relative h-full min-w-0 flex-1')],
                      [
                        h.main(
                          [
                            h.Id('content'),
                            h.Class(
                              'relative h-full w-full [scrollbar-gutter:stable] overflow-y-auto overscroll-none bg-background text-foreground shadow-md ring ring-border/50 outline-none md:rounded-panel',
                            ),
                          ],
                          [
                            h.div(
                              [h.Class('px-5 pt-12 pb-28 md:px-10')],
                              [
                                h.submodel({
                                  slotId: 'pages',
                                  model: model.pages,
                                  view: Pages.view,
                                  viewInputs: { route: model.route },
                                  toParentMessage: (message) => Message.GotPagesMessage({ message }),
                                }),
                              ],
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
      h.submodel({
        slotId: 'customize',
        model: model.customize,
        view: Customize.view,
        toParentMessage: (message) => Message.GotCustomizeMessage({ message }),
      }),
    ],
  ),
});

const systemThemeSubscriptions = Subscription.make<Model, Message>()((entry) => ({
  systemTheme: entry(
    { isSystemPreference: Schema.Boolean },
    {
      modelToDependencies: (model) => ({ isSystemPreference: model.themePreference === 'System' }),
      dependenciesToStream: ({ isSystemPreference }) =>
        Stream.when(
          Dom.streamFromMediaQuery({
            query: DARK_COLOR_SCHEME_QUERY,
            mapMatches: (isDark) => Message.UpdatedSystemTheme({ systemTheme: isDark ? 'Dark' : 'Light' }),
          }),
          Effect.sync(() => isSystemPreference),
        ),
    },
  ),
}));

export const subscriptions = Subscription.aggregate(
  systemThemeSubscriptions,
  Subscription.lift({
    docsSidebarViewport: Sidebar.subscriptions.viewport,
    docsSidebarToggleShortcut: Sidebar.subscriptions.toggleShortcut,
  })<Model, Message>({
    read: (model) => Option.some(model.sidebar),
    toParentMessage: toSidebarMessage,
  }),
  Subscription.lift(Customize.subscriptions)<Model, Message>({
    read: (model) => Option.some(model.customize),
    toParentMessage: (message) => Message.GotCustomizeMessage({ message }),
  }),
  Subscription.lift(Pages.subscriptions)<Model, Message>({
    read: (model) => Option.some(model.pages),
    toParentMessage: (message) => Message.GotPagesMessage({ message }),
  }),
);

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
import * as Pages from './pages.generated.ts';
import { cn } from './pavo/cn.ts';
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
  ChangedThemePreference: { themePreference: ThemePreference },
  ChangedSystemTheme: { systemTheme: ResolvedTheme },
  GotCustomizeMessage: { message: Customize.Message },
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
    ChangedThemePreference: ({ themePreference }) => {
      const themeChange = applyThemeChange(model, modifyFields(model, { themePreference: () => themePreference }));
      return {
        model: themeChange.model,
        commands: [...(themeChange.commands ?? []), SaveThemePreference({ themePreference })],
      };
    },
    ChangedSystemTheme: ({ systemTheme }) =>
      applyThemeChange(model, modifyFields(model, { systemTheme: () => systemTheme })),
    GotCustomizeMessage: ({ message }) => foldCustomize(model, message),
    GotPagesMessage: ({ message }) => foldPages(model, message),
  });

const isThemePreference = Schema.is(ThemePreference);

const navLink = (item: Pages.NavItem, route: Pages.AppRoute, h: HtmlBuilder<Message>): Html => {
  const isCurrent = item.routeTag === route._tag;
  return h.li(
    [],
    [
      h.a(
        [
          h.Href(item.href),
          ...(isCurrent ? [h.AriaCurrent('page')] : []),
          h.Class(
            cn(
              'flex h-menu-item items-center rounded-control px-menu-item-pad text-control text-muted-foreground transition-colors hover:bg-highlight hover:text-foreground',
              isCurrent && 'bg-highlight font-medium text-foreground',
            ),
          ),
        ],
        [item.title],
      ),
    ],
  );
};

const themePicker = (model: Model, h: HtmlBuilder<Message>): Html =>
  Tabs.radioGroup(
    {
      variant: 'segmented',
      ariaLabel: 'Theme',
      value: model.themePreference,
      onValueChange: (value) =>
        Message.ChangedThemePreference({ themePreference: isThemePreference(value) ? value : model.themePreference }),
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
  h.aside(
    [h.Class('hidden w-64 shrink-0 flex-col gap-group overflow-y-auto px-3 py-group md:flex')],
    [
      h.a(
        [h.Href(Pages.homeHref), h.Class('px-2 text-body font-semibold text-foreground')],
        ['Pavo ', h.span([h.Class('font-normal text-muted-foreground')], ['· Foldkit'])],
      ),
      h.nav(
        [h.AriaLabel('Components'), h.Class('flex flex-col gap-tight')],
        [
          h.h2([h.Class('px-2 text-caption font-medium text-muted-foreground')], ['Components']),
          h.ul(
            [h.Class('flex flex-col')],
            Array.map(Pages.NAV_ITEMS, (item) => navLink(item, model.route, h)),
          ),
        ],
      ),
      h.footer([h.Class('mt-auto flex flex-col gap-related')], [themePicker(model, h)]),
    ],
  );

const routeTitle = (route: Pages.AppRoute): string =>
  Option.match(
    Array.findFirst(Pages.NAV_ITEMS, (item) => item.routeTag === route._tag),
    { onNone: () => 'Pavo · Foldkit', onSome: (item) => `${item.title} · Pavo · Foldkit` },
  );

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: routeTitle(model.route),
  body: h.div(
    [h.Class('relative flex h-dvh w-screen bg-sidebar font-sans antialiased')],
    [
      ...Array.map(Customize.customizationCss(model.customize.customization), (css) => h.style([], [css])),
      sidebar(model, h),
      h.div(
        [h.Class('flex h-full min-w-0 flex-1 md:py-3 md:pe-3')],
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
            mapMatches: (isDark) => Message.ChangedSystemTheme({ systemTheme: isDark ? 'Dark' : 'Light' }),
          }),
          Effect.sync(() => isSystemPreference),
        ),
    },
  ),
}));

export const subscriptions = Subscription.aggregate(
  systemThemeSubscriptions,
  Subscription.lift(Customize.subscriptions)<Model, Message>({
    read: (model) => Option.some(model.customize),
    toParentMessage: (message) => Message.GotCustomizeMessage({ message }),
  }),
  Subscription.lift(Pages.subscriptions)<Model, Message>({
    read: (model) => Option.some(model.pages),
    toParentMessage: (message) => Message.GotPagesMessage({ message }),
  }),
);

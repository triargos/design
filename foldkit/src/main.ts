import { Array, Effect, Option, Schema } from 'effect';
import { Calendar, Command, Runtime, Subscription, Update } from 'foldkit';
import type { Document, Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { UrlRequest, load, pushUrl } from 'foldkit/navigation';
import { modifyFields } from 'foldkit/struct';
import { Url, toString as urlToString } from 'foldkit/url';

import { brandingThemeCss } from '../../src/lib/theme/branding-theme.ts';
import { BRAND_PRIMARY_COLORS, DEFAULT_BRANDING_THEME } from '../../src/lib/theme/branding.ts';
import * as Pages from './pages.generated.ts';
import { cn } from './pavo/cn.ts';

const ColorScheme = Schema.Literals(['Light', 'Dark']);
type ColorScheme = typeof ColorScheme.Type;

const PrimaryColor = Schema.Literals(BRAND_PRIMARY_COLORS);
type PrimaryColor = typeof PrimaryColor.Type;

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export const Model = Schema.Struct({
  route: Pages.AppRoute,
  colorScheme: ColorScheme,
  primaryColor: PrimaryColor,
  pages: Pages.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  CompletedNavigateInternal: {},
  CompletedLoadExternal: {},
  CompletedApplyColorScheme: {},
  ClickedLink: { request: UrlRequest },
  ChangedUrl: { url: Url },
  ClickedToggleColorScheme: {},
  ChangedPrimaryColor: { primaryColor: PrimaryColor },
  GotPagesMessage: { message: Pages.Message },
});
export type Message = typeof Message.Type;

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

const ApplyColorScheme = Command.define('ApplyColorScheme', {
  args: { colorScheme: ColorScheme },
  messages: [Message.CompletedApplyColorScheme],
  execute: ({ colorScheme }) =>
    Effect.sync(() => {
      const isDark = colorScheme === 'Dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      return Message.CompletedApplyColorScheme();
    }),
});

export const Flags = Schema.Struct({
  today: Calendar.CalendarDate,
  colorScheme: ColorScheme,
});
export type Flags = typeof Flags.Type;

export const flags: Effect.Effect<Flags> = Effect.gen(function* () {
  const today = yield* Calendar.today.local;
  const isDark = yield* Effect.sync(() => window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches);
  return { today, colorScheme: isDark ? 'Dark' : 'Light' };
});

export const init: Runtime.RoutingApplicationInit<Model, Message, Flags> = (flags, url) =>
  Update.foldChildInit(Pages.init({ today: flags.today }), {
    toParentModel: (pages) => ({
      route: Pages.urlToAppRoute(url),
      colorScheme: flags.colorScheme,
      primaryColor: DEFAULT_BRANDING_THEME.primaryColor,
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

const toggledColorScheme = (colorScheme: ColorScheme): ColorScheme => (colorScheme === 'Dark' ? 'Light' : 'Dark');

type UpdateReturn = Update.Return<Model, Message>;

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    CompletedNavigateInternal: () => ({ model }),
    CompletedLoadExternal: () => ({ model }),
    CompletedApplyColorScheme: () => ({ model }),
    ClickedLink: ({ request }) =>
      UrlRequest.match<UpdateReturn>(request, {
        Internal: ({ url }) => ({ model, commands: [NavigateInternal({ url: urlToString(url) })] }),
        External: ({ href }) => ({ model, commands: [LoadExternal({ href })] }),
      }),
    ChangedUrl: ({ url }) => ({ model: modifyFields(model, { route: () => Pages.urlToAppRoute(url) }) }),
    ClickedToggleColorScheme: () => {
      const nextColorScheme = toggledColorScheme(model.colorScheme);
      return {
        model: modifyFields(model, { colorScheme: () => nextColorScheme }),
        commands: [ApplyColorScheme({ colorScheme: nextColorScheme })],
      };
    },
    ChangedPrimaryColor: ({ primaryColor }) => ({ model: modifyFields(model, { primaryColor: () => primaryColor }) }),
    GotPagesMessage: ({ message }) => foldPages(model, message),
  });

const isPrimaryColor = Schema.is(PrimaryColor);

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
      h.div(
        [h.Class('mt-auto flex flex-col gap-related px-2')],
        [
          h.label([h.For('primary-color'), h.Class('text-label')], ['Primary']),
          h.select(
            [
              h.Id('primary-color'),
              h.Class('h-control rounded-control bg-field px-field-pad text-control'),
              h.OnChange((value) =>
                Message.ChangedPrimaryColor({ primaryColor: isPrimaryColor(value) ? value : model.primaryColor }),
              ),
            ],
            Array.map(BRAND_PRIMARY_COLORS, (color) =>
              h.option([h.Value(color), h.Selected(color === model.primaryColor)], [color]),
            ),
          ),
          h.button(
            [
              h.Type('button'),
              h.OnClick(Message.ClickedToggleColorScheme()),
              h.Class('h-control rounded-control text-control text-muted-foreground hover:bg-highlight'),
            ],
            [model.colorScheme === 'Dark' ? 'Light mode' : 'Dark mode'],
          ),
        ],
      ),
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
      h.style([], [brandingThemeCss({ ...DEFAULT_BRANDING_THEME, primaryColor: model.primaryColor })]),
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
    ],
  ),
});

export const subscriptions = Subscription.lift(Pages.subscriptions)<Model, Message>({
  read: (model) => Option.some(model.pages),
  toParentMessage: (message) => Message.GotPagesMessage({ message }),
});

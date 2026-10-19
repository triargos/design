import {
  DEFAULT_BRANDING_THEME,
  BRAND_BASE_COLORS,
  BRAND_DESTRUCTIVE_COLORS,
  BRAND_PRIMARY_COLORS,
  type BrandingTheme,
} from '~/lib/theme/branding';

import { useLayoutEffect, type ReactNode } from 'react';

import { cardSurface } from '~/components/ui/inset-card';
import { popupSurface } from '~/components/ui/popover';

import { brandingThemeCss, type ThemeMode } from '~/lib/theme/branding-theme';
import { cn } from '~/lib/utils';

import { tokenCss } from '../storybook/kit/tokens';

export const FRAME_MODES = ['light', 'dark', 'side by side'] as const;
export type FrameMode = (typeof FRAME_MODES)[number];

export const FRAME_SURFACES = ['page', 'card', 'popup'] as const;
export type FrameSurface = (typeof FRAME_SURFACES)[number];

/**
 * Where the story sits on the page panel.
 * - `centered`: shrink-wrapped in the middle; single controls.
 * - `column`: a centered column as wide as a `MaxWidth` `base` page; cards and blocks.
 * - `page`: top-left with `main-layout.tsx` padding; whole pages and the foundation pages.
 */
export const FRAME_LAYOUTS = ['centered', 'column', 'page'] as const;
export type FrameLayout = (typeof FRAME_LAYOUTS)[number];

export interface FrameSettings {
  readonly mode: FrameMode;
  readonly surface: FrameSurface;
  readonly layout: FrameLayout;
  readonly branding: BrandingTheme;
  /**
   * The tuned scales as CSS (`tokenCss`, `storybook/kit/tokens.ts`), from the Tokens panel. Unlayered and after the
   * app's CSS, so it wins over `tailwind.css`.
   */
  readonly tokenCss: string;
}

const oneOf = <A extends string>(literals: ReadonlyArray<A>, value: unknown, fallback: A): A =>
  literals.find((literal) => literal === value) ?? fallback;

const themeOverride = (parameters: Record<string, unknown>): unknown => {
  const themes = parameters['themes'];
  return typeof themes === 'object' && themes !== null && 'themeOverride' in themes ? themes.themeOverride : undefined;
};

/**
 * Reads the toolbar globals and the story's parameters; unknown values fall back to the defaults. `theme` and
 * `themes.themeOverride` are `@storybook/addon-themes`' global and parameter, so its toolbar picks the mode.
 */
export function frameSettings(globals: Record<string, unknown>, parameters: Record<string, unknown>): FrameSettings {
  return {
    mode: oneOf(FRAME_MODES, themeOverride(parameters) ?? globals['theme'], 'light'),
    surface: oneOf(FRAME_SURFACES, globals['surface'], 'page'),
    layout: oneOf(FRAME_LAYOUTS, parameters['frame'], 'centered'),
    branding: {
      primaryColor: oneOf(BRAND_PRIMARY_COLORS, globals['primaryColor'], DEFAULT_BRANDING_THEME.primaryColor),
      baseColor: oneOf(BRAND_BASE_COLORS, globals['baseColor'], DEFAULT_BRANDING_THEME.baseColor),
      destructiveColor: oneOf(
        BRAND_DESTRUCTIVE_COLORS,
        globals['destructiveColor'],
        DEFAULT_BRANDING_THEME.destructiveColor,
      ),
    },
    tokenCss: tokenCss(globals),
  };
}

const layoutClasses: Record<FrameLayout, { outer: string; inner: string }> = {
  centered: { outer: 'flex flex-1 items-center justify-center p-10', inner: 'max-w-full' },
  column: { outer: 'flex flex-1 items-center justify-center p-10', inner: 'w-full max-w-3xl' },
  page: { outer: 'flex-1 px-5 pt-10 pb-28 md:px-10', inner: 'w-full' },
};

function SurfaceWrap({ surface, children }: { surface: FrameSurface; children: ReactNode }) {
  switch (surface) {
    case 'page':
      return children;
    case 'card':
      return (
        <div data-surface='card' className={cn(cardSurface, 'rounded-card p-6 text-card-foreground')}>
          {children}
        </div>
      );
    case 'popup':
      return (
        <div data-surface='popup' className={cn(popupSurface, 'p-4')}>
          {children}
        </div>
      );
  }
}

/**
 * The app frame from `main-layout.tsx`: `bg-sidebar` with the light-only primary gradient, and the page panel on top.
 * A dark panel carries `.dark` itself, so light and dark render side by side under one `<html>`.
 */
function Panel({ mode, settings, children }: { mode: ThemeMode; settings: FrameSettings; children: ReactNode }) {
  const { primaryColor, baseColor, destructiveColor } = settings.branding;
  const layout = layoutClasses[settings.layout];
  return (
    <section
      data-frame-mode={mode}
      style={{ colorScheme: mode }}
      className={cn('relative flex min-w-0 flex-1 flex-col gap-2 bg-sidebar p-3 pt-2', mode === 'dark' && 'dark')}>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-linear-to-br from-sidebar from-20% via-primary/10 via-40% to-sidebar to-60% dark:hidden'
      />
      <header className='relative flex h-6 items-center gap-1.5 px-2 text-caption text-muted-foreground'>
        <span className='font-medium text-sidebar-foreground capitalize'>{mode}</span>
        <span aria-hidden='true'>·</span>
        <span>
          {primaryColor} / {baseColor} / {destructiveColor}
        </span>
      </header>
      <div className='relative flex flex-1 flex-col rounded-panel bg-background text-foreground shadow-md ring ring-border/50'>
        <div className={layout.outer}>
          <div className={layout.inner}>
            <SurfaceWrap surface={settings.surface}>{children}</SurfaceWrap>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Renders the organization branding exactly as `root.tsx` does, then one panel per mode. In a single mode, `<html>`
 * carries the mode too, so portaled popups and dialogs follow it; side by side, portals render light.
 */
export function Frame({ settings, children }: { settings: FrameSettings; children: ReactNode }) {
  const singleMode: ThemeMode | undefined = settings.mode === 'side by side' ? undefined : settings.mode;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', singleMode === 'dark');
    root.style.colorScheme = singleMode ?? 'light';
  }, [singleMode]);

  const modes: ReadonlyArray<ThemeMode> = singleMode === undefined ? ['light', 'dark'] : [singleMode];
  return (
    <>
      <style data-organization-branding>{brandingThemeCss(settings.branding)}</style>
      <style data-tuned-tokens>{settings.tokenCss}</style>
      <div className='flex min-h-dvh font-sans antialiased'>
        {modes.map((mode) => (
          <Panel key={mode} mode={mode} settings={settings}>
            {children}
          </Panel>
        ))}
      </div>
    </>
  );
}

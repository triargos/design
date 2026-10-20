import { cva } from 'class-variance-authority';
import type { CSSProperties } from 'react';

/**
 * Intent × emphasis, the two color axes every colored primitive shares (DESIGN.md, Color).
 *
 * - `intent` says what it means. It sets the `--intent-*` variables to that intent's token set (`tailwind.css`).
 * - `emphasis` says how loud it is. It paints with the `--intent-*` variables, so one class string serves every intent.
 *
 * Only color lives here: size, shape and type stay with the component, and a component may restyle one emphasis on top
 * (Button's `solid` gradient, its `raised` field edge). Class strings stay literal so Tailwind finds them.
 */
const INTENTS = ['neutral', 'primary', 'info', 'success', 'warning', 'destructive'] as const;
type Intent = (typeof INTENTS)[number];

const EMPHASES = ['solid', 'subtle', 'outline', 'ghost', 'raised'] as const;
type Emphasis = (typeof EMPHASES)[number];

/**
 * The style that carries a color from data (a category or status color an organization chose) to `intent: 'data'`. Any
 * CSS color: a hex, `var(--category-3)`. A data color is not an intent (DESIGN.md, Color); `Badge` and `StatusDot` take it
 * as `color`.
 */
const dataColorStyle = (color: string): CSSProperties => ({ ['--data-color' as string]: color });

const intentVariants = cva('', {
  variants: {
    intent: {
      neutral:
        '[--intent-border:var(--neutral-border)] [--intent-solid-foreground:var(--neutral-solid-foreground)] [--intent-solid:var(--neutral-solid)] [--intent-subtle-foreground:var(--neutral-subtle-foreground)] [--intent-subtle:var(--neutral-subtle)] [--intent:var(--neutral)]',
      primary:
        '[--intent-border:var(--primary-border)] [--intent-solid-foreground:var(--primary-solid-foreground)] [--intent-solid:var(--primary-solid)] [--intent-subtle-foreground:var(--primary-subtle-foreground)] [--intent-subtle:var(--primary-subtle)] [--intent:var(--primary)]',
      info: '[--intent-border:var(--info-border)] [--intent-solid-foreground:var(--info-solid-foreground)] [--intent-solid:var(--info-solid)] [--intent-subtle-foreground:var(--info-subtle-foreground)] [--intent-subtle:var(--info-subtle)] [--intent:var(--info)]',
      success:
        '[--intent-border:var(--success-border)] [--intent-solid-foreground:var(--success-solid-foreground)] [--intent-solid:var(--success-solid)] [--intent-subtle-foreground:var(--success-subtle-foreground)] [--intent-subtle:var(--success-subtle)] [--intent:var(--success)]',
      warning:
        '[--intent-border:var(--warning-border)] [--intent-solid-foreground:var(--warning-solid-foreground)] [--intent-solid:var(--warning-solid)] [--intent-subtle-foreground:var(--warning-subtle-foreground)] [--intent-subtle:var(--warning-subtle)] [--intent:var(--warning)]',
      destructive:
        '[--intent-border:var(--destructive-border)] [--intent-solid-foreground:var(--destructive-solid-foreground)] [--intent-solid:var(--destructive-solid)] [--intent-subtle-foreground:var(--destructive-subtle-foreground)] [--intent-subtle:var(--destructive-subtle)] [--intent:var(--destructive)]',
      /** A color from data, set with `dataColorStyle`: the `--intent-*` set derives from it (`intent-data`, `tailwind.css`). */
      data: 'intent-data',
    },
    emphasis: {
      solid: 'bg-(--intent-solid) text-(--intent-solid-foreground)',
      subtle: 'bg-(--intent-subtle) text-(--intent-subtle-foreground)',
      outline: 'bg-transparent text-(--intent-subtle-foreground) inset-ring inset-ring-(--intent-border)',
      ghost: 'bg-transparent text-(--intent-subtle-foreground)',
      // A chip lifted off its surface: white in light (raised surfaces clamp to white), a white veil in dark, inside a
      // translucent ring (`shadow-raised`). The ring and the dark veil take the color of whatever sits behind them.
      raised: 'bg-card bg-clip-border text-(--intent-subtle-foreground) shadow-raised dark:bg-foreground/10',
    },
    /** Hover and open states, for controls. Static elements (badges, alerts) leave it off. */
    interactive: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      interactive: true,
      emphasis: 'solid',
      className:
        'hover:bg-[color-mix(in_oklch,var(--intent-solid),black_8%)] aria-expanded:bg-[color-mix(in_oklch,var(--intent-solid),black_8%)]',
    },
    {
      interactive: true,
      emphasis: ['subtle', 'outline'],
      className:
        'hover:bg-[color-mix(in_oklch,var(--intent-subtle),var(--intent)_8%)] aria-expanded:bg-[color-mix(in_oklch,var(--intent-subtle),var(--intent)_8%)]',
    },
    {
      interactive: true,
      emphasis: 'ghost',
      className: 'hover:bg-(--intent-subtle) aria-expanded:bg-(--intent-subtle) aria-pressed:bg-(--intent-subtle)',
    },
    {
      interactive: true,
      emphasis: 'raised',
      // Hover strengthens the ring rather than graying the fill, so the chip keeps the surface's tint around it.
      className:
        'hover:shadow-raised-hover aria-expanded:shadow-raised-hover dark:hover:bg-foreground/14 dark:aria-expanded:bg-foreground/14',
    },
  ],
  defaultVariants: {
    intent: 'neutral',
    emphasis: 'subtle',
    interactive: false,
  },
});

export { dataColorStyle, EMPHASES, INTENTS, intentVariants, type Emphasis, type Intent };

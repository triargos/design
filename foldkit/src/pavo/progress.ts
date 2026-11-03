import { Progress as ProgressPrimitive } from '@foldkit/ui';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child } from './part.ts';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

const formatValue = (value: number, min: number, max: number, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'percent' }).format((value - min) / (max - min));

export type ViewConfig = Readonly<{
  id: string;
  value?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  locale?: string | undefined;
  ariaLabel?: string | undefined;
  label?: ReadonlyArray<Child> | undefined;
  isValueShown?: boolean | undefined;
  className?: string | undefined;
}>;

export const view = <Message>(config: ViewConfig, h: HtmlBuilder<Message>): Html => {
  const {
    id,
    value,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    locale = DEFAULT_LOCALE,
    ariaLabel,
    label,
    isValueShown = false,
    className,
  } = config;

  const formattedValue = value === undefined ? undefined : formatValue(value, min, max, locale);

  return ProgressPrimitive.view(
    {
      id,
      ...(value === undefined ? {} : { value }),
      min,
      max,
      ...(formattedValue === undefined ? {} : { valueText: formattedValue }),
      ...(ariaLabel === undefined ? {} : { ariaLabel }),
      toView: (render) =>
        h.div(
          [...render.progress, h.DataAttribute('slot', 'progress'), h.Class(cn('flex flex-wrap gap-part', className))],
          [
            ...(label === undefined
              ? []
              : [h.span([...render.label, h.DataAttribute('slot', 'progress-label'), h.Class('text-label')], label)]),
            ...(isValueShown
              ? [
                  h.span(
                    [
                      h.AriaHidden(true),
                      h.DataAttribute('slot', 'progress-value'),
                      h.Class('ml-auto text-body text-muted-foreground tabular-nums'),
                    ],
                    formattedValue === undefined ? [] : [formattedValue],
                  ),
                ]
              : []),
            h.div(
              [
                ...render.track,
                h.DataAttribute('slot', 'progress-track'),
                h.Class('relative flex h-track w-full items-center overflow-x-hidden rounded-track bg-muted'),
              ],
              [
                h.div([
                  ...render.indicator,
                  h.DataAttribute('slot', 'progress-indicator'),
                  h.Class(
                    'h-full bg-primary-solid transition-[width] duration-move ease-move motion-reduce:transition-none',
                  ),
                ]),
              ],
            ),
          ],
        ),
    },
    h,
  );
};

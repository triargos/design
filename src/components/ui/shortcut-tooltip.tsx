import { Fragment } from 'react';
import type * as React from 'react';

import { Kbd, KbdGroup } from '~/components/ui/kbd';
import { useLocale } from '~/components/ui/locale';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

import { formatShortcut, useIsMac } from '~/lib/shortcut';
import { cn } from '~/lib/utils';

interface ShortcutTooltipProps {
  /** The control's name. */
  readonly label: React.ReactNode;
  /** One combination per step: `['$mod+Enter']` is pressed at once, `['G', 'P']` is a chord (G, then P). */
  readonly shortcut: ReadonlyArray<string>;
  readonly side?: React.ComponentProps<typeof TooltipContent>['side'];
  readonly align?: React.ComponentProps<typeof TooltipContent>['align'];
  /** The label between the steps of a chord; else `LocaleProvider` `labels.shortcutThen`, else “then”. */
  readonly thenLabel?: string;
  readonly className?: string;
  /** The control: it becomes the tooltip's trigger. */
  readonly children: React.ReactElement;
}

/**
 * A control's name and its keyboard shortcut in a tooltip: `$mod` prints ⌘ on a Mac and Ctrl elsewhere. The keys are
 * hidden from screen readers; the label stays the control's name.
 */
function ShortcutTooltip({ label, shortcut, side, align, thenLabel, className, children }: ShortcutTooltipProps) {
  const mac = useIsMac();
  const { labels } = useLocale();
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent
        side={side}
        align={align}
        // 2px more than a tooltip's padding: room beside the keys.
        className={cn('flex items-center gap-control-gap px-[calc(var(--tooltip-pad-x)+2px)]', className)}>
        {label}
        <KbdGroup aria-hidden>
          {shortcut.map((step, index) => (
            <Fragment key={index}>
              {index > 0 && <span className='text-muted-foreground'>{thenLabel ?? labels.shortcutThen}</span>}
              {/* The caption's line height, so the keys don't make the tooltip taller than its text. */}
              <Kbd className='h-(--text-caption--line-height) min-w-(--text-caption--line-height)'>
                {formatShortcut(step, { mac })}
              </Kbd>
            </Fragment>
          ))}
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  );
}

export { ShortcutTooltip };

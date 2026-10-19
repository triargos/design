import { Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Kbd, KbdGroup } from '~/components/ui/kbd.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip.tsx';

import { formatShortcut } from '~/actions/utils/format-shortcut.ts';

interface ShortcutTooltipProps {
  label: string;
  /** `['N', 'C']` for a chord, `['$mod+Enter']` for a combination. */
  shortcut?: readonly string[];
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactElement;
}

export function ShortcutTooltip({ label, shortcut, side, children }: ShortcutTooltipProps) {
  const { t } = useTranslation('common');
  const hasShortcut = shortcut !== undefined && shortcut.length > 0;
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} className='flex items-center gap-1.5 rounded-control-sm px-2.5 py-1 text-caption'>
        <span>{label}</span>
        {hasShortcut && (
          <KbdGroup aria-hidden>
            {shortcut.map((key, index) => (
              <Fragment key={`${key}-${index}`}>
                {index > 0 && (
                  <span className='text-muted-foreground'>
                    {t(($) => $.keyboardHelp.chordSeparator, { defaultValue: 'dann' })}
                  </span>
                )}
                <Kbd className='h-4 min-w-4'>{formatShortcut(key)}</Kbd>
              </Fragment>
            ))}
          </KbdGroup>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

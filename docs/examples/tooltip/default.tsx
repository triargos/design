import { IconDots } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

/** A name for an icon-only control, after 200ms. */
export function TooltipDefault() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button emphasis='ghost' size='icon' aria-label='More actions' />}>
        <IconDots />
      </TooltipTrigger>
      <TooltipContent>More actions</TooltipContent>
    </Tooltip>
  );
}

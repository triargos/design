import { BoldIcon, CopyIcon, ItalicIcon, LinkIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

const ACTIONS = [
  { label: 'Bold', icon: <BoldIcon /> },
  { label: 'Italic', icon: <ItalicIcon /> },
  { label: 'Insert link', icon: <LinkIcon /> },
  { label: 'Copy', icon: <CopyIcon /> },
];

/** Icon-only buttons in one `TooltipProvider`: the first tooltip opens after 200ms, its neighbours at once. */
export function TooltipDelayGroup() {
  return (
    <TooltipProvider>
      <div className='flex items-center gap-0.5 text-muted-foreground'>
        {ACTIONS.map(({ label, icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger render={<Button emphasis='ghost' size='icon' aria-label={label} />}>{icon}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

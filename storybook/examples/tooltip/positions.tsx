import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

const SIDES = [
  { side: 'top', label: 'Oben' },
  { side: 'right', label: 'Rechts' },
  { side: 'bottom', label: 'Unten' },
  { side: 'left', label: 'Links' },
] as const;

export function TooltipPositions() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {SIDES.map(({ side, label }) => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button type='button' intent='neutral' emphasis='raised' size='sm' />}>
            {label}
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip {label.toLowerCase()}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

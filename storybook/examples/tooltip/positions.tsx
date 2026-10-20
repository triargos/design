import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

const SIDES = [
  { side: 'top', label: 'Top' },
  { side: 'right', label: 'Right' },
  { side: 'bottom', label: 'Bottom' },
  { side: 'left', label: 'Left' },
] as const;

/** `side` picks the edge; the default is the top. */
export function TooltipPositions() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {SIDES.map(({ side, label }) => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button size='sm' />}>{label}</TooltipTrigger>
          <TooltipContent side={side}>Opens on the {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

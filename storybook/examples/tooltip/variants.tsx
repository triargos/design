import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

/** Two appearances, compared before one becomes the only one: light (a small popup) and inverted (the neutral solid). */
export function TooltipVariants() {
  return (
    <div className='flex items-center gap-2'>
      <Tooltip>
        <TooltipTrigger render={<Button type='button' intent='neutral' emphasis='raised' size='sm' />}>
          Light
        </TooltipTrigger>
        <TooltipContent appearance='light'>Weitere Aktionen</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button type='button' intent='neutral' emphasis='raised' size='sm' />}>
          Inverted
        </TooltipTrigger>
        <TooltipContent appearance='inverted'>Weitere Aktionen</TooltipContent>
      </Tooltip>
    </div>
  );
}

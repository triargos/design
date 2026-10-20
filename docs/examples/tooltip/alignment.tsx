import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

const ALIGNS = [
  { align: 'start', label: 'Start' },
  { align: 'center', label: 'Center' },
  { align: 'end', label: 'End' },
] as const;

/** `align` lines the tooltip up with the trigger's start, center or end. */
export function TooltipAlignment() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {ALIGNS.map(({ align, label }) => (
        <Tooltip key={align}>
          <TooltipTrigger render={<Button className='w-32' />}>{label}</TooltipTrigger>
          <TooltipContent align={align}>Aligned to the {align}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

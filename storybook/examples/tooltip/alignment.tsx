import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

const ALIGNS = [
  { align: 'start', label: 'Anfang' },
  { align: 'center', label: 'Mitte' },
  { align: 'end', label: 'Ende' },
] as const;

export function TooltipAlignment() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {ALIGNS.map(({ align, label }) => (
        <Tooltip key={align}>
          <TooltipTrigger render={<Button type='button' intent='neutral' emphasis='raised' className='w-32' />}>
            {label}
          </TooltipTrigger>
          <TooltipContent align={align}>Ausgerichtet: {label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

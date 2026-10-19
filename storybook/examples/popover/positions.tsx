import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverDescription, PopoverTrigger } from '~/components/ui/popover';

const SIDES = [
  { side: 'top', label: 'Oben' },
  { side: 'right', label: 'Rechts' },
  { side: 'bottom', label: 'Unten' },
  { side: 'left', label: 'Links' },
] as const;

/** `side` picks the edge; it flips away from the viewport edge. */
export function PopoverPositions() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {SIDES.map(({ side, label }) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button type='button' intent='neutral' emphasis='raised' size='sm' />}>
            {label}
          </PopoverTrigger>
          <PopoverContent side={side} className='w-48'>
            <PopoverDescription>Öffnet {label.toLowerCase()}.</PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

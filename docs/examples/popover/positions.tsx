import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverDescription, PopoverTrigger } from '~/components/ui/popover';

const SIDES = [
  { side: 'top', label: 'Top' },
  { side: 'right', label: 'Right' },
  { side: 'bottom', label: 'Bottom' },
  { side: 'left', label: 'Left' },
] as const;

/** `side` picks the edge; it flips away from the viewport edge. */
export function PopoverPositions() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {SIDES.map(({ side, label }) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button />}>{label}</PopoverTrigger>
          <PopoverContent side={side} className='w-48'>
            <PopoverDescription>Opens on the {side}.</PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

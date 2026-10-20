import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { IconCheck } from '@tabler/icons-react';

import { selectionControlVariants } from '~/components/ui/checkbox';

import { cn } from '~/lib/utils';

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return <RadioGroupPrimitive data-slot='radio-group' className={cn('grid w-full gap-2', className)} {...props} />;
}

/**
 * The `Checkbox` surface as a circle. Checked: the brand fill and a 6px dot that scales in and out; with reduced motion
 * it only fades.
 */
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot='radio-group-item'
      className={cn(selectionControlVariants({ shape: 'round' }), className)}
      {...props}>
      <RadioPrimitive.Indicator
        data-slot='radio-group-indicator'
        className={cn(
          'flex size-4 items-center justify-center',
          'transition-[scale,opacity] duration-feedback ease-enter motion-reduce:transition-opacity',
          'data-ending-style:scale-0 data-ending-style:opacity-0 data-starting-style:scale-0 data-starting-style:opacity-0',
          'motion-reduce:data-ending-style:scale-100 motion-reduce:data-starting-style:scale-100',
        )}>
        <span className='size-1.5 rounded-full bg-current' />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

/**
 * A radio as a card, for a few choices that deserve room (a plan, a role). Unchecked it is the quiet shell fill;
 * checked it lifts to a card with a check in the brand hue. Inside a `RadioGroup`, which owns the value and the grid.
 */
function ChoiceCard({ className, children, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot='choice-card'
      className={cn(
        'group/choice-card flex min-h-12 w-full items-center justify-between gap-3 rounded-control-lg bg-shell px-4 py-3 text-left text-body font-medium text-foreground outline-none',
        'transition-[background-color,box-shadow] duration-feedback hover:bg-muted',
        'focus-visible:ring-3 focus-visible:ring-ring/24',
        'data-checked:bg-card data-checked:shadow-raised',
        'aria-invalid:inset-ring aria-invalid:inset-ring-destructive-border',
        'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-none',
        className,
      )}
      {...props}>
      <span className='min-w-0 truncate'>{children}</span>
      <IconCheck
        aria-hidden
        className='size-4 shrink-0 text-primary opacity-0 transition-opacity duration-feedback group-data-checked/choice-card:opacity-100 group-data-disabled/choice-card:text-disabled-foreground'
      />
    </RadioPrimitive.Root>
  );
}

export { ChoiceCard, RadioGroup, RadioGroupItem };

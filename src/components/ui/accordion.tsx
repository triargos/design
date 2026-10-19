import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';

import { cn } from '~/lib/utils';

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return <AccordionPrimitive.Root data-slot='accordion' className={cn('flex w-full flex-col', className)} {...props} />;
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot='accordion-item'
      className={cn('border-b border-border-subtle pb-1 last:border-b-0', className)}
      {...props}
    />
  );
}

/** Plus that folds into a minus: the vertical stroke collapses while the trigger's panel is open. */
function AccordionIndicator({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      className={className}>
      <line x1='3' x2='13' y1='8' y2='8' />
      <line
        x1='8'
        x2='8'
        y1='3'
        y2='13'
        className='origin-center transition-transform duration-move ease-move in-data-panel-open:scale-y-0 motion-reduce:transition-none'
      />
    </svg>
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className='flex min-w-0'>
      <AccordionPrimitive.Trigger
        data-slot='accordion-trigger'
        className={cn(
          'hit-area relative flex w-full flex-1 items-start gap-2 rounded-control px-2 pt-2 pb-1 text-left text-body font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/24 aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
          className,
        )}
        {...props}>
        <span
          data-slot='accordion-trigger-icon'
          className='flex h-[1lh] w-5 shrink-0 items-center justify-center text-muted-foreground'>
          <AccordionIndicator className='size-3' />
        </span>
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * The inner wrapper indents the content to the trigger's title (`ps-9`); override it through `className`.
 * `panelClassName`'s `overflow-hidden` clips shadows and focus rings; widen it with negative margin + matching
 * padding when the content needs bleed room.
 */
function AccordionContent({
  className,
  panelClassName,
  children,
  ...props
}: AccordionPrimitive.Panel.Props & { panelClassName?: string }) {
  return (
    <AccordionPrimitive.Panel
      data-slot='accordion-content'
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden text-body transition-[height] duration-move ease-move data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none',
        panelClassName,
      )}
      {...props}>
      <div
        className={cn(
          'ps-9 pe-10 pb-1 [&_a:not([data-slot=button])]:underline [&_a:not([data-slot=button])]:underline-offset-3 [&_a:not([data-slot=button])]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
          className,
        )}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

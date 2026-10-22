import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '~/lib/utils';

/**
 * `default`: sections on a page or in a padded card; the trigger is a rounded control. `flush`: rows to the edge of a
 * `CardContent className='overflow-hidden'` or a `SheetBody`, as `ItemList` rows are: square triggers that fill with
 * `row-hover`, the title on the card header's text.
 */
type AccordionVariant = 'default' | 'flush';

const AccordionVariantContext = React.createContext<AccordionVariant>('default');

function Accordion({
  className,
  variant = 'default',
  ...props
}: AccordionPrimitive.Root.Props & { variant?: AccordionVariant }) {
  return (
    <AccordionVariantContext value={variant}>
      <AccordionPrimitive.Root
        data-slot='accordion'
        data-variant={variant}
        className={cn(
          'flex w-full flex-col',
          // In a sheet, run past the body's padding to the sheet's edge.
          variant === 'flush' && 'in-data-[slot=sheet-body]:-mx-modal in-data-[slot=sheet-body]:w-auto',
          className,
        )}
        {...props}
      />
    </AccordionVariantContext>
  );
}

const accordionItemVariants = cva('border-b border-border-subtle last:border-b-0', {
  variants: { variant: { default: 'pb-[calc(var(--accordion-pad)/2)]', flush: '' } },
});

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  const variant = React.use(AccordionVariantContext);
  return (
    <AccordionPrimitive.Item
      data-slot='accordion-item'
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * Plus that folds into a minus: the vertical stroke collapses while the trigger's panel is open. 5/3 units of a 16-unit
 * box drawn at `icon-xs` (12px): the icons' 1.25px stroke.
 */
function AccordionIndicator({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      fill='none'
      stroke='currentColor'
      strokeWidth={5 / 3}
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

const accordionTriggerVariants = cva(
  'hit-area relative flex w-full flex-1 items-start gap-row-gap text-left text-body font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/24 aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
  {
    variants: {
      variant: {
        // `area`, not `control`: a long title wraps.
        default: 'rounded-area px-(--accordion-pad) pt-(--accordion-pad) pb-[calc(var(--accordion-pad)/2)]',
        // `card` in from the content's edge: on the header text, as `ItemList` rows. The ring sits inside the row, which
        // the card clips.
        flush:
          'items-center rounded-none px-card py-row-pad-y transition-colors duration-feedback hover:bg-row-hover focus-visible:ring-inset in-data-[slot=sheet-body]:px-modal',
      },
    },
  },
);

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  const variant = React.use(AccordionVariantContext);
  return (
    <AccordionPrimitive.Header className='flex min-w-0'>
      <AccordionPrimitive.Trigger
        data-slot='accordion-trigger'
        className={cn(accordionTriggerVariants({ variant }), className)}
        {...props}>
        <span
          data-slot='accordion-trigger-icon'
          className='flex h-[1lh] w-icon-lg shrink-0 items-center justify-center text-muted-foreground'>
          <AccordionIndicator className='size-icon-xs' />
        </span>
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// Indented to the trigger's title: its padding + the icon box (`icon-lg`) + the gap.
const accordionContentVariants = cva(
  '[&_a:not([data-slot=button])]:underline [&_a:not([data-slot=button])]:underline-offset-3 [&_a:not([data-slot=button])]:hover:text-foreground [&_p:not(:last-child)]:mb-group',
  {
    variants: {
      variant: {
        default:
          'ps-[calc(var(--accordion-pad)+var(--spacing-icon-lg)+var(--spacing-row-gap))] pe-(--accordion-content-pad-end) pb-[calc(var(--accordion-pad)/2)]',
        flush:
          'ps-[calc(var(--spacing-card)+var(--spacing-icon-lg)+var(--spacing-row-gap))] pe-card pb-(--accordion-flush-content-pad-bottom) in-data-[slot=sheet-body]:ps-[calc(var(--spacing-modal)+var(--spacing-icon-lg)+var(--spacing-row-gap))] in-data-[slot=sheet-body]:pe-modal',
      },
    },
  },
);

/**
 * `className` styles the inner wrapper, which indents the content to the trigger's title. The panel clips
 * (`overflow-hidden`, for the height animation), so shadows and focus rings in the content need room inside it.
 */
function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  const variant = React.use(AccordionVariantContext);
  return (
    <AccordionPrimitive.Panel
      data-slot='accordion-content'
      className={
        'h-(--accordion-panel-height) overflow-hidden text-body transition-[height] duration-move ease-move data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none'
      }
      {...props}>
      <div className={cn(accordionContentVariants({ variant }), className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

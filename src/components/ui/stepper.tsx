import { CheckIcon, LoaderCircleIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '~/lib/utils';

type StepState = 'active' | 'completed' | 'inactive';

type StepItemContextValue = {
  step: number;
  state: StepState;
  isLoading: boolean;
};

/** The active step; steps before it are done. */
const ActiveStepContext = React.createContext(0);
const StepItemContext = React.createContext<StepItemContextValue | null>(null);

interface StepperProps extends React.ComponentProps<'div'> {
  /** The active step, 1-based; past the last step every step is done. */
  value: number;
  orientation?: 'horizontal' | 'vertical';
}

function Stepper({ value, orientation = 'horizontal', className, ...props }: StepperProps) {
  return (
    <ActiveStepContext value={value}>
      <div
        role='list'
        className={cn(
          'group/stepper flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center data-[orientation=vertical]:flex-col',
          className,
        )}
        data-orientation={orientation}
        data-slot='stepper'
        {...props}
      />
    </ActiveStepContext>
  );
}

interface StepperItemProps extends React.ComponentProps<'div'> {
  step: number;
  /** Spins the indicator while this step is the active one. */
  loading?: boolean;
}

/**
 * Horizontal: indicator, title and separator in one row; an item with a separator grows to fill the row.
 * Vertical: indicator column on the left, `StepperContent` beside it; `StepperSeparator` draws the
 * connector down to the next step.
 */
function StepperItem({ step, loading = false, className, children, ...props }: StepperItemProps) {
  const activeStep = React.use(ActiveStepContext);
  const state: StepState = step < activeStep ? 'completed' : step === activeStep ? 'active' : 'inactive';
  const isLoading = loading && state === 'active';

  return (
    <StepItemContext value={{ isLoading, state, step }}>
      <div
        role='listitem'
        aria-current={state === 'active' ? 'step' : undefined}
        className={cn(
          'group/step relative flex',
          'group-data-[orientation=horizontal]/stepper:items-center group-data-[orientation=horizontal]/stepper:gap-related group-data-[orientation=horizontal]/stepper:not-last:has-data-[slot=stepper-separator]:flex-1',
          'group-data-[orientation=vertical]/stepper:items-start group-data-[orientation=vertical]/stepper:gap-3 group-data-[orientation=vertical]/stepper:not-last:pb-group',
          className,
        )}
        data-slot='stepper-item'
        data-state={state}
        data-loading={isLoading || undefined}
        {...props}>
        {children}
      </div>
    </StepItemContext>
  );
}

/**
 * 20px, so its centre sits on the first line of a `text-body` title (21px) without an offset. Fills only, no rim:
 * todo `muted`, active `primary-subtle`, done `primary-solid`. A ring on a 20px circle antialiases unevenly in Safari
 * (see `RadioGroupItem`).
 */
function StepperIndicator({ className, ...props }: React.ComponentProps<'span'>) {
  const item = React.use(StepItemContext);
  if (!item) {
    throw new Error('StepperIndicator must be used within a StepperItem');
  }

  return (
    <span
      className={cn(
        'relative flex size-5 shrink-0 items-center justify-center rounded-full text-caption font-medium tabular-nums transition-[background-color,color] duration-feedback',
        'bg-muted text-muted-foreground',
        'data-[state=active]:bg-primary-subtle data-[state=active]:text-primary-subtle-foreground',
        'data-[state=completed]:bg-primary-solid data-[state=completed]:text-primary-solid-foreground',
        className,
      )}
      data-slot='stepper-indicator'
      data-state={item.state}
      {...props}>
      <span className='transition-[opacity,scale] duration-feedback group-data-loading/step:scale-0 group-data-loading/step:opacity-0 group-data-[state=completed]/step:scale-0 group-data-[state=completed]/step:opacity-0'>
        {item.step}
      </span>
      <CheckIcon
        aria-hidden='true'
        strokeWidth={3}
        className='absolute size-3 scale-0 opacity-0 transition-[opacity,scale] duration-feedback group-data-[state=completed]/step:scale-100 group-data-[state=completed]/step:opacity-100'
      />
      {item.isLoading && <LoaderCircleIcon aria-hidden='true' className='absolute size-3 animate-spin' />}
    </span>
  );
}

/** Vertical only: the column beside the indicator that holds title, description and step content. */
function StepperContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-tight', className)} data-slot='stepper-content' {...props} />
  );
}

function StepperTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn(
        'text-body font-medium text-foreground group-data-[state=inactive]/step:text-muted-foreground',
        className,
      )}
      data-slot='stepper-title'
      {...props}
    />
  );
}

function StepperDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-body text-muted-foreground', className)} data-slot='stepper-description' {...props} />;
}

/** Connects the step to the next one; brand once the step is done. Hidden on the last step. */
function StepperSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'shrink-0 rounded-full bg-border transition-colors duration-feedback group-last/step:hidden group-data-[state=completed]/step:bg-primary-solid',
        'group-data-[orientation=horizontal]/stepper:mx-related group-data-[orientation=horizontal]/stepper:h-px group-data-[orientation=horizontal]/stepper:flex-1',
        // From 4px below the indicator to 4px above the next one (the item's `pb-group` minus 4px).
        'group-data-[orientation=vertical]/stepper:absolute group-data-[orientation=vertical]/stepper:top-6 group-data-[orientation=vertical]/stepper:bottom-1 group-data-[orientation=vertical]/stepper:left-2.5 group-data-[orientation=vertical]/stepper:w-px group-data-[orientation=vertical]/stepper:-translate-x-1/2',
        className,
      )}
      data-slot='stepper-separator'
      {...props}
    />
  );
}

export { Stepper, StepperContent, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle };

import { IconCheck } from '@tabler/icons-react';
import * as React from 'react';

import { Spinner } from '~/components/ui/spinner';

import { cn } from '~/lib/utils';

type StepState = 'active' | 'completed' | 'inactive';

interface StepperContextValue {
  /** The active step; steps before it are done. */
  readonly value: number;
  readonly isLoading: boolean;
}

const StepperContext = React.createContext<StepperContextValue>({ value: 0, isLoading: false });

interface StepperProps extends React.ComponentProps<'div'> {
  /** The active step, 1-based; past the last step every step is done. */
  value: number;
  /** The active step is working: its indicator spins. */
  isLoading?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

function Stepper({ value, isLoading = false, orientation = 'horizontal', className, ...props }: StepperProps) {
  return (
    <StepperContext value={{ value, isLoading }}>
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
    </StepperContext>
  );
}

interface StepperItemProps extends React.ComponentProps<'div'> {
  step: number;
}

/**
 * A step: its numbered indicator, the children (a `StepperTitle`, and in a vertical stepper a `StepperDescription` and
 * the step's content), and the connector to the next step. Horizontal: one row; an item that is not the last grows to
 * fill it. Vertical: the indicator column on the left, the children beside it.
 */
function StepperItem({ step, className, children, ...props }: StepperItemProps) {
  const { value, isLoading: stepperLoading } = React.use(StepperContext);
  const state: StepState = step < value ? 'completed' : step === value ? 'active' : 'inactive';
  const isLoading = stepperLoading && state === 'active';

  return (
    <div
      role='listitem'
      aria-current={state === 'active' ? 'step' : undefined}
      className={cn(
        'group/step relative flex',
        'group-data-[orientation=horizontal]/stepper:items-center group-data-[orientation=horizontal]/stepper:gap-related group-data-[orientation=horizontal]/stepper:not-last:flex-1',
        'group-data-[orientation=vertical]/stepper:items-start group-data-[orientation=vertical]/stepper:gap-3 group-data-[orientation=vertical]/stepper:not-last:pb-group',
        className,
      )}
      data-slot='stepper-item'
      data-state={state}
      data-loading={isLoading || undefined}
      {...props}>
      <StepperIndicator step={step} loading={isLoading} />
      <div
        data-slot='stepper-content'
        className='flex min-w-0 flex-col gap-tight group-data-[orientation=vertical]/stepper:flex-1'>
        {children}
      </div>
      <StepperSeparator />
    </div>
  );
}

/**
 * 20px, so its centre sits on the first line of a `text-body` title (21px) without an offset. Fills only, no rim:
 * todo `muted`, active `primary-subtle`, done `primary-solid`. A ring on a 20px circle antialiases unevenly in Safari
 * (see `RadioGroupItem`).
 */
function StepperIndicator({ step, loading }: { step: number; loading: boolean }) {
  return (
    <span
      className={cn(
        'relative flex size-5 shrink-0 items-center justify-center rounded-full text-caption font-medium tabular-nums transition-[background-color,color] duration-feedback',
        'bg-muted text-muted-foreground',
        'group-data-[state=active]/step:bg-primary-subtle group-data-[state=active]/step:text-primary-subtle-foreground',
        'group-data-[state=completed]/step:bg-primary-solid group-data-[state=completed]/step:text-primary-solid-foreground',
      )}
      data-slot='stepper-indicator'>
      <span className='transition-[opacity,scale] duration-feedback group-data-loading/step:scale-0 group-data-loading/step:opacity-0 group-data-[state=completed]/step:scale-0 group-data-[state=completed]/step:opacity-0'>
        {step}
      </span>
      <IconCheck
        aria-hidden='true'
        className='absolute size-3 scale-0 opacity-0 transition-[opacity,scale] duration-feedback group-data-[state=completed]/step:scale-100 group-data-[state=completed]/step:opacity-100'
      />
      {loading && <Spinner size={12} className='absolute' />}
    </span>
  );
}

/** Connects the step to the next one; brand once the step is done. Hidden on the last step. */
function StepperSeparator() {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'shrink-0 rounded-full bg-border transition-colors duration-feedback group-last/step:hidden group-data-[state=completed]/step:bg-primary-solid',
        'group-data-[orientation=horizontal]/stepper:mx-related group-data-[orientation=horizontal]/stepper:h-px group-data-[orientation=horizontal]/stepper:flex-1',
        // From 4px below the indicator to 4px above the next one (the item's `pb-group` minus 4px).
        'group-data-[orientation=vertical]/stepper:absolute group-data-[orientation=vertical]/stepper:top-6 group-data-[orientation=vertical]/stepper:bottom-1 group-data-[orientation=vertical]/stepper:left-2.5 group-data-[orientation=vertical]/stepper:w-px group-data-[orientation=vertical]/stepper:-translate-x-1/2',
      )}
      data-slot='stepper-separator'
    />
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

export { Stepper, StepperDescription, StepperItem, StepperTitle };

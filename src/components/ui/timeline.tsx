import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { cn } from '~/lib/utils';

/** The last reached step; it and the steps before it are completed. */
const ReachedStepContext = React.createContext(0);

interface TimelineProps extends React.ComponentProps<'div'> {
  /** The last reached step, 1-based. */
  value?: number;
  orientation?: 'horizontal' | 'vertical';
}

function Timeline({ value = 1, orientation = 'vertical', className, ...props }: TimelineProps) {
  return (
    <ReachedStepContext value={value}>
      <div
        data-slot='timeline'
        className={cn(
          'group/timeline flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
          className,
        )}
        data-orientation={orientation}
        {...props}
      />
    </ReachedStepContext>
  );
}

interface TimelineItemProps extends React.ComponentProps<'div'> {
  step: number;
}

/**
 * An event: its marker and the line to the next event, then the children (`TimelineDate`, `TimelineTitle`,
 * `TimelineContent`). A reached event takes the brand edge; the line turns brand once the next one is reached.
 */
function TimelineItem({ step, className, children, ...props }: TimelineItemProps) {
  const reachedStep = React.use(ReachedStepContext);

  return (
    <div
      data-slot='timeline-item'
      className={cn(
        'group/timeline-item relative flex flex-1 flex-col group-data-[orientation=horizontal]/timeline:mt-8 not-last:group-data-[orientation=horizontal]/timeline:pe-8 group-data-[orientation=vertical]/timeline:ms-8 not-last:group-data-[orientation=vertical]/timeline:pb-12',
        className,
      )}
      data-completed={step <= reachedStep || undefined}
      {...props}>
      <div
        data-slot='timeline-separator'
        aria-hidden='true'
        data-completed={step < reachedStep || undefined}
        className='absolute self-start bg-primary-subtle group-last/timeline-item:hidden data-completed:bg-primary-solid group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=horizontal]/timeline:h-0.5 group-data-[orientation=horizontal]/timeline:w-[calc(100%-1rem-0.25rem)] group-data-[orientation=horizontal]/timeline:translate-x-4.5 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:w-0.5 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=vertical]/timeline:translate-y-4.5'
      />
      <div
        data-slot='timeline-indicator'
        aria-hidden='true'
        className='absolute size-4 rounded-full border-2 border-primary-border group-data-completed/timeline-item:border-primary-solid group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=horizontal]/timeline:left-0 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:top-0 group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:-translate-x-1/2'
      />
      {children}
    </div>
  );
}

function TimelineDate({ className, render, ...props }: useRender.ComponentProps<'time'>) {
  return useRender({
    defaultTagName: 'time',
    render,
    state: { slot: 'timeline-date' },
    props: mergeProps<'time'>(
      {
        className: cn(
          'mb-1 block text-caption font-medium text-muted-foreground max-sm:group-data-[orientation=vertical]/timeline:h-4',
          className,
        ),
      },
      props,
    ),
  });
}

function TimelineTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot='timeline-title' className={cn('text-caption text-muted-foreground', className)} {...props} />;
}

function TimelineContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot='timeline-content' className={cn('mt-0.5 text-body text-muted-foreground', className)} {...props} />
  );
}

export { Timeline, TimelineContent, TimelineDate, TimelineItem, TimelineTitle };

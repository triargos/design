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
 * `TimelineContent`). A reached event takes the brand edge; the line turns brand once the next one is reached. The
 * marker column is `--timeline-marker-size` plus `--spacing-group` to the content; the line stops 2px short of each
 * marker.
 */
function TimelineItem({ step, className, children, ...props }: TimelineItemProps) {
  const reachedStep = React.use(ReachedStepContext);

  return (
    <div
      data-slot='timeline-item'
      className={cn(
        'group/timeline-item relative flex flex-1 flex-col group-data-[orientation=horizontal]/timeline:mt-[calc(var(--timeline-marker-size)+var(--spacing-group))] not-last:group-data-[orientation=horizontal]/timeline:pe-(--timeline-step-x) group-data-[orientation=vertical]/timeline:ms-[calc(var(--timeline-marker-size)+var(--spacing-group))] not-last:group-data-[orientation=vertical]/timeline:pb-(--timeline-step)',
        className,
      )}
      data-completed={step <= reachedStep || undefined}
      {...props}>
      <div
        data-slot='timeline-separator'
        aria-hidden='true'
        data-completed={step < reachedStep || undefined}
        className='absolute self-start bg-primary-subtle group-last/timeline-item:hidden data-completed:bg-primary-solid group-data-[orientation=horizontal]/timeline:-top-[calc(var(--timeline-marker-size)/2+var(--spacing-group))] group-data-[orientation=horizontal]/timeline:h-0.5 group-data-[orientation=horizontal]/timeline:w-[calc(100%-var(--timeline-marker-size)-4px)] group-data-[orientation=horizontal]/timeline:translate-x-[calc(var(--timeline-marker-size)+2px)] group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:-left-[calc(var(--timeline-marker-size)/2+var(--spacing-group))] group-data-[orientation=vertical]/timeline:h-[calc(100%-var(--timeline-marker-size)-4px)] group-data-[orientation=vertical]/timeline:w-0.5 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=vertical]/timeline:translate-y-[calc(var(--timeline-marker-size)+2px)]'
      />
      <div
        data-slot='timeline-indicator'
        aria-hidden='true'
        className='absolute size-(--timeline-marker-size) rounded-full border-2 border-primary-border group-data-completed/timeline-item:border-primary-solid group-data-[orientation=horizontal]/timeline:-top-[calc(var(--timeline-marker-size)/2+var(--spacing-group))] group-data-[orientation=horizontal]/timeline:left-0 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:top-0 group-data-[orientation=vertical]/timeline:-left-[calc(var(--timeline-marker-size)/2+var(--spacing-group))] group-data-[orientation=vertical]/timeline:-translate-x-1/2'
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
          'mb-tight block text-caption font-medium text-muted-foreground max-sm:group-data-[orientation=vertical]/timeline:h-(--text-caption--line-height)',
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

import { Progress as ProgressPrimitive } from '@base-ui/react/progress';

import { cn } from '~/lib/utils';

/** Label and value go in as children, above the track. `locale` formats `ProgressValue` (BCP 47, default `en-US`). */
function Progress({ className, children, locale = 'en-US', ...props }: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      locale={locale}
      className={cn('flex flex-wrap gap-3', className)}
      {...props}>
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn('relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted', className)}
      data-slot='progress-track'
      {...props}
    />
  );
}

function ProgressIndicator({ className, ...props }: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot='progress-indicator'
      className={cn(
        'h-full bg-primary-solid transition-[width] duration-move ease-move motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label className={cn('text-body font-medium', className)} data-slot='progress-label' {...props} />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn('ml-auto text-body text-muted-foreground tabular-nums', className)}
      data-slot='progress-value'
      {...props}
    />
  );
}

export { Progress, ProgressLabel, ProgressValue };

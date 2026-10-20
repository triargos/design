import { cn } from '~/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='skeleton' className={cn('animate-shimmer rounded-control-sm', className)} {...props} />;
}

/** `length` full-width lines. */
function SkeletonList({ className, length = 5 }: { className?: string; length?: number }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length }, (_, index) => (
        <Skeleton key={index} className='h-4 w-full' />
      ))}
    </div>
  );
}

/** A stepper of `steps` steps while it loads; the first step reads as the current one. */
function StepperSkeleton({
  steps = 2,
  withDescription = false,
  className,
}: {
  steps?: number;
  withDescription?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex w-full flex-row', className)}>
      {Array.from({ length: steps }, (_, index) => (
        <div key={index} className='flex items-center not-last:flex-1 max-md:items-start'>
          <div className='flex items-center gap-3 rounded max-md:flex-col'>
            <div className={cn('size-8 shrink-0 animate-pulse rounded-full', index === 0 ? 'bg-card' : 'bg-card/50')} />
            <div className='text-center md:text-left'>
              <div className={cn('mb-1 h-4 animate-pulse rounded', index === 0 ? 'w-24 bg-card' : 'w-20 bg-card/50')} />
              {withDescription && (
                <div className={cn('h-3 animate-pulse rounded', index === 0 ? 'w-16 bg-card/70' : 'w-14 bg-card/30')} />
              )}
            </div>
          </div>
          {index < steps - 1 && <div className='h-0.5 flex-1 animate-pulse bg-card max-md:mt-3.5 md:mx-4' />}
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonList, StepperSkeleton };

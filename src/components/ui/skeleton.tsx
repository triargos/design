import { cn } from '~/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='skeleton' className={cn('animate-shimmer rounded-control-sm', className)} {...props} />;
}

export { Skeleton };

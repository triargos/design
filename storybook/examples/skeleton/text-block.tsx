import { Skeleton } from '~/components/ui/skeleton';

/** A paragraph: full lines, the last one short. */
export function SkeletonTextBlock() {
  return (
    <div className='flex w-96 flex-col gap-2'>
      <Skeleton className='h-4 w-1/3' />
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-3 w-4/5' />
    </div>
  );
}

import { Skeleton } from '~/components/ui/skeleton';

/** `Skeleton` in the shape of the content: an avatar, a title, a line. */
export function SkeletonShapes() {
  return (
    <div className='flex w-80 flex-col gap-4'>
      {[0, 1].map((row) => (
        <div key={row} className='flex items-center gap-3'>
          <Skeleton className='size-9 rounded-full' />
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-3.5 w-2/5' />
            <Skeleton className='h-3 w-3/5' />
          </div>
        </div>
      ))}
    </div>
  );
}

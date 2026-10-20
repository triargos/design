import { Spinner } from '~/components/ui/spinner';

export function LoaderSizes() {
  return (
    <div className='flex items-center gap-4 text-muted-foreground'>
      <Spinner size={16} />
      <Spinner size={20} />
      <Spinner size={24} />
      <Spinner size={32} />
    </div>
  );
}

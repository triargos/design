import { Loader } from '~/components/ui/loader';

export function LoaderSizes() {
  return (
    <div className='flex items-center gap-4 text-muted-foreground'>
      <Loader size={16} />
      <Loader size={20} />
      <Loader size={24} />
      <Loader size={32} />
    </div>
  );
}

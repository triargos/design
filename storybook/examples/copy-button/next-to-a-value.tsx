import { CopyButton } from '~/components/ui/copy-button';

export function CopyButtonNextToAValue() {
  return (
    <div className='flex items-center gap-2'>
      <span className='text-body font-medium'>Grundschule am See</span>
      <CopyButton value='Grundschule am See' size='icon-xs' />
    </div>
  );
}

import { CopyButton } from '~/components/ui/copy-button';

export function CopyButtonNextToAValue() {
  return (
    <div className='flex items-center gap-2'>
      <span className='font-mono text-body font-medium'>INV-2024-0042</span>
      <CopyButton value='INV-2024-0042' label='Copy invoice number' size='icon-sm' />
    </div>
  );
}

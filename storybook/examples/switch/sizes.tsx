import { Switch } from '~/components/ui/switch';

/** default 20×36 · sm 16×28 */
export function SwitchSizes() {
  return (
    <div className='flex items-center gap-4'>
      <Switch size='sm' aria-label='Klein' defaultChecked />
      <Switch aria-label='Standard' defaultChecked />
    </div>
  );
}

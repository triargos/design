import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';

export function LabelWithCheckbox() {
  return (
    <div className='flex items-center gap-2'>
      <Checkbox id='label-terms' />
      <Label htmlFor='label-terms'>Nutzungsbedingungen akzeptieren</Label>
    </div>
  );
}

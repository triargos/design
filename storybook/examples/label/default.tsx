import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

/** Legacy: new forms use `FieldLabel` inside a `Field`. */
export function LabelDefault() {
  return (
    <div className='flex w-80 flex-col gap-2'>
      <Label htmlFor='label-name' required>
        Name
      </Label>
      <Input id='label-name' placeholder='Max Mustermann' />
    </div>
  );
}

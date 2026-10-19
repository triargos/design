import { Field, FieldLabel } from '~/components/ui/field';
import { Switch } from '~/components/ui/switch';

export function SwitchDisabled() {
  return (
    <Field orientation='horizontal' data-disabled className='w-72'>
      <FieldLabel htmlFor='locked-switch'>Vom Sekretariat festgelegt</FieldLabel>
      <Switch id='locked-switch' defaultChecked disabled />
    </Field>
  );
}

import { Field, FieldLabel } from '~/components/ui/field';
import { Switch } from '~/components/ui/switch';

export function SwitchDisabled() {
  return (
    <Field orientation='horizontal' disabled className='w-72'>
      <FieldLabel htmlFor='switch-locked'>Set by the workspace owner</FieldLabel>
      <Switch id='switch-locked' defaultChecked disabled />
    </Field>
  );
}

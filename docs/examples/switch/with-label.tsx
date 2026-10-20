import { Field, FieldLabel } from '~/components/ui/field';
import { Switch } from '~/components/ui/switch';

export function SwitchWithLabel() {
  return (
    <Field orientation='horizontal' className='w-72'>
      <FieldLabel htmlFor='switch-reminders'>Due date reminders</FieldLabel>
      <Switch id='switch-reminders' />
    </Field>
  );
}

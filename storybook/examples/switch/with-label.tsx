import { Field, FieldLabel } from '~/components/ui/field';
import { Switch } from '~/components/ui/switch';

export function SwitchWithLabel() {
  return (
    <Field orientation='horizontal' className='w-72'>
      <FieldLabel htmlFor='sms'>SMS bei Abwesenheit</FieldLabel>
      <Switch id='sms' />
    </Field>
  );
}

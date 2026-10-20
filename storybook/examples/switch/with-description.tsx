import { Field, FieldContent, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Switch } from '~/components/ui/switch';

export function SwitchWithDescription() {
  return (
    <Field orientation='horizontal' className='max-w-md'>
      <FieldContent>
        <FieldLabel htmlFor='switch-digest'>Daily digest</FieldLabel>
        <FieldDescription>One email in the morning instead of one per update.</FieldDescription>
      </FieldContent>
      <Switch id='switch-digest' defaultChecked />
    </Field>
  );
}

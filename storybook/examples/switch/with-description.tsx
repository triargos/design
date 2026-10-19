import { Field, FieldContent, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Switch } from '~/components/ui/switch';

export function SwitchWithDescription() {
  return (
    <Field orientation='horizontal' className='max-w-md'>
      <FieldContent>
        <FieldLabel htmlFor='digest'>Tägliche Zusammenfassung</FieldLabel>
        <FieldDescription>Eine E-Mail am Morgen statt einzelner Nachrichten.</FieldDescription>
      </FieldContent>
      <Switch id='digest' defaultChecked />
    </Field>
  );
}

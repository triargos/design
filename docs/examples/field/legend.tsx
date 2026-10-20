import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

const EVENTS = ['Comments', 'Assigned tasks', 'Due dates'] as const;

/** `FieldLegend variant='legend'` heads a section of fields; the default `label` names one question. */
export function FieldLegendVariants() {
  return (
    <FieldSet className='w-full max-w-md'>
      <FieldLegend variant='legend'>Notifications</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor='legend-email'>Email address</FieldLabel>
          <Input id='legend-email' type='email' defaultValue='maya@acme.com' />
        </Field>
        <FieldSet>
          <FieldLegend>Notify me about</FieldLegend>
          <FieldGroup className='gap-related'>
            {EVENTS.map((label, index) => (
              <Field key={label} orientation='horizontal'>
                <Checkbox id={`legend-notify-${index}`} defaultChecked={index !== 2} />
                <FieldLabel htmlFor={`legend-notify-${index}`} className='font-normal'>
                  {label}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </FieldSet>
  );
}

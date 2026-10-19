import { useState } from 'react';

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '~/components/ui/field';
import {
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';

const SEND_MODES = [
  { value: 'IMMEDIATE', label: 'Sofort' },
  { value: 'SCHEDULED', label: 'Gesammelt' },
];

/** Settings: `orientation='horizontal'` puts the label and description beside the control. */
export function FieldHorizontal() {
  const [mode, setMode] = useState('IMMEDIATE');
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Einladungs-E-Mails</InsetCardTitle>
        <InsetCardDescription>Wann neue Mitglieder ihre Einladung bekommen.</InsetCardDescription>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <FieldGroup>
          <Field orientation='horizontal'>
            <FieldContent>
              <FieldLabel>Versand</FieldLabel>
              <FieldDescription>Sofort nach dem Import oder gesammelt am Morgen.</FieldDescription>
            </FieldContent>
            <Select items={SEND_MODES} value={mode} onValueChange={(next) => setMode(next ?? 'IMMEDIATE')}>
              <SelectTrigger className='w-full max-w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEND_MODES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <FieldSeparator />
          <Field orientation='horizontal'>
            <FieldContent>
              <FieldLabel htmlFor='field-reminder'>Erinnerung</FieldLabel>
              <FieldDescription>Nach drei Tagen ohne Antwort noch einmal schicken.</FieldDescription>
            </FieldContent>
            <Switch id='field-reminder' defaultChecked />
          </Field>
        </FieldGroup>
      </InsetCardContent>
    </InsetCard>
  );
}

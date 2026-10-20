import { useState } from 'react';

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '~/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';

const DIGESTS = [
  { value: 'instant', label: 'Instantly' },
  { value: 'daily', label: 'Daily' },
];

/**
 * Settings: `orientation='horizontal'` puts the label and description beside the control. Beside an input or a select,
 * a label alone centers on the field.
 */
export function FieldHorizontal() {
  const [digest, setDigest] = useState('instant');
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>How you hear about changes to your tasks.</CardDescription>
      </CardHeader>
      <CardContent className='p-card'>
        <FieldGroup>
          <Field orientation='horizontal'>
            <FieldContent>
              <FieldLabel htmlFor='field-reply-to'>Reply-to address</FieldLabel>
            </FieldContent>
            <Input id='field-reply-to' type='email' defaultValue='team@acme.com' className='w-full max-w-48' />
          </Field>
          <FieldSeparator />
          <Field orientation='horizontal'>
            <FieldContent>
              <FieldLabel htmlFor='field-digest'>Email</FieldLabel>
              <FieldDescription>Each update as it happens, or one email in the morning.</FieldDescription>
            </FieldContent>
            <Select items={DIGESTS} value={digest} onValueChange={setDigest}>
              <SelectTrigger id='field-digest' className='w-full max-w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIGESTS.map((item) => (
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
              <FieldLabel htmlFor='field-mentions'>Mentions only</FieldLabel>
              <FieldDescription>Skip updates unless someone mentions you.</FieldDescription>
            </FieldContent>
            <Switch id='field-mentions' defaultChecked />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

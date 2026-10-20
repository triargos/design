import { useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox';
import { Field, FieldLabel } from '~/components/ui/field';
import type { SelectOption } from '~/components/ui/select';

const ROLES: ReadonlyArray<SelectOption> = ['Owner', 'Admin', 'Member', 'Guest'].map((role) => ({
  value: role.toLowerCase(),
  label: role,
}));

/** `allowCustom`: an option's value or the typed text. A typed value reads “Custom” in its list row. */
export function ComboboxAllowCustom() {
  const [role, setRole] = useState<string | null>('Contractor');
  return (
    <Field className='w-64'>
      <FieldLabel htmlFor='role'>Role</FieldLabel>
      <Combobox allowCustom items={ROLES} value={role} onValueChange={setRole}>
        <ComboboxInput id='role' placeholder='Choose or type a role' />
        <ComboboxContent>
          <ComboboxEmpty>No roles found</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

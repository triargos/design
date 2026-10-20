import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select';

const ROLES: ReadonlyArray<SelectOption> = ['Owner', 'Admin', 'Member', 'Guest'].map((role) => ({
  value: role.toLowerCase(),
  label: role,
}));

/** `allowCustom`: an option's value or the typed text; a typed value reads “Custom” in its list row. */
export function SearchSelectCustomValue() {
  const [value, setValue] = useState<string | null>('Contractor');
  return (
    <Field className='w-64'>
      <FieldLabel htmlFor='role'>Role</FieldLabel>
      <SearchSelect
        allowCustom
        id='role'
        items={ROLES}
        value={value}
        onValueChange={setValue}
        placeholder='Choose or type a role'
      />
    </Field>
  );
}

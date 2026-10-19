import { useState } from 'react';

import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field';

const CHILDREN = ['Mia Schmidt', 'Leon Weber', 'Emma Fischer'] as const;

/** A parent that stands for a partial selection. */
export function CheckboxIndeterminate() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set([CHILDREN[0]]));
  const all = selected.size === CHILDREN.length;
  const toggle = (name: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(name);
      else next.delete(name);
      return next;
    });
  return (
    <FieldGroup className='w-64 gap-2'>
      <Field orientation='horizontal'>
        <Checkbox
          id='children-all'
          checked={all}
          indeterminate={selected.size > 0 && !all}
          onCheckedChange={(checked) => setSelected(new Set(checked ? CHILDREN : []))}
        />
        <FieldLabel htmlFor='children-all'>Alle Kinder</FieldLabel>
      </Field>
      {CHILDREN.map((name) => (
        <Field key={name} orientation='horizontal' className='pl-6'>
          <Checkbox id={name} checked={selected.has(name)} onCheckedChange={(checked) => toggle(name, checked)} />
          <FieldLabel htmlFor={name} className='font-normal'>
            {name}
          </FieldLabel>
        </Field>
      ))}
    </FieldGroup>
  );
}

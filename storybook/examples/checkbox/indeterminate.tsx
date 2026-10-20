import { useState } from 'react';

import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field';

const TASKS = ['Write the brief', 'Review the design', 'Book the launch'] as const;

/** A parent that stands for a partial selection. */
export function CheckboxIndeterminate() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set([TASKS[0]]));
  const all = selected.size === TASKS.length;
  const toggle = (task: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(task);
      else next.delete(task);
      return next;
    });
  return (
    <FieldGroup className='w-64 gap-2'>
      <Field orientation='horizontal'>
        <Checkbox
          id='tasks-all'
          checked={all}
          indeterminate={selected.size > 0 && !all}
          onCheckedChange={(checked) => setSelected(new Set(checked ? TASKS : []))}
        />
        <FieldLabel htmlFor='tasks-all'>All tasks</FieldLabel>
      </Field>
      {TASKS.map((task, index) => (
        <Field key={task} orientation='horizontal' className='pl-6'>
          <Checkbox
            id={`task-${index}`}
            checked={selected.has(task)}
            onCheckedChange={(checked) => toggle(task, checked)}
          />
          <FieldLabel htmlFor={`task-${index}`} className='font-normal'>
            {task}
          </FieldLabel>
        </Field>
      ))}
    </FieldGroup>
  );
}

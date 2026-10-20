import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox';
import type { SelectOption } from '~/components/ui/select';

const PROJECTS: ReadonlyArray<SelectOption> = ['Atlas', 'Beacon', 'Comet', 'Delta'].map((name) => ({
  value: name.toLowerCase(),
  label: name,
}));

const STATES = [
  { label: 'Project', items: PROJECTS, value: null },
  { label: 'Project, loading', items: [], value: null, empty: 'Loading projects…' },
  { label: 'Project, invalid', items: PROJECTS, value: null, invalid: true },
  { label: 'Project, read-only', items: PROJECTS, value: 'beacon', readOnly: true },
  { label: 'Project, disabled', items: PROJECTS, value: 'beacon', disabled: true },
];

/** Placeholder; loading (`ComboboxEmpty` while the items load); invalid, read-only, disabled. */
export function ComboboxStates() {
  return (
    <div className='grid w-64 gap-2'>
      {STATES.map((state) => (
        <Combobox
          key={state.label}
          items={state.items}
          value={state.value}
          onValueChange={() => undefined}
          readOnly={state.readOnly}
          disabled={state.disabled}>
          <ComboboxInput
            aria-label={state.label}
            aria-invalid={state.invalid}
            disabled={state.disabled}
            placeholder='Choose a project'
          />
          <ComboboxContent>
            <ComboboxEmpty>{state.empty ?? 'No projects found'}</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ))}
    </div>
  );
}

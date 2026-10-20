import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from '~/components/ui/select';

const ROLES: ReadonlyArray<SelectOption> = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'guest', label: 'Guest' },
];

const STATES = [
  { label: 'Role', value: null },
  { label: 'Role, invalid', value: null, invalid: true },
  { label: 'Role, read-only', value: 'member', readOnly: true },
  { label: 'Role, disabled', value: 'member', disabled: true },
];

/** Placeholder, invalid, read-only, disabled. */
export function SelectStates() {
  return (
    <div className='grid w-56 gap-2'>
      {STATES.map((state) => (
        <Select
          key={state.label}
          items={ROLES}
          value={state.value}
          onValueChange={() => undefined}
          readOnly={state.readOnly}
          disabled={state.disabled}>
          <SelectTrigger aria-label={state.label} aria-invalid={state.invalid}>
            <SelectValue placeholder='Choose a role' />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

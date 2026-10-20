import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'guest', label: 'Guest' },
];

function RoleItems() {
  return (
    <SelectContent>
      {ROLES.map((role) => (
        <SelectItem key={role.value} value={role.value}>
          {role.label}
        </SelectItem>
      ))}
    </SelectContent>
  );
}

/** Placeholder, invalid, read-only, disabled. */
export function SelectStates() {
  return (
    <div className='grid w-56 gap-2'>
      <Select items={ROLES}>
        <SelectTrigger aria-label='Role'>
          <SelectValue placeholder='Choose a role' />
        </SelectTrigger>
        <RoleItems />
      </Select>
      <Select items={ROLES}>
        <SelectTrigger aria-label='Role, invalid' aria-invalid>
          <SelectValue placeholder='Choose a role' />
        </SelectTrigger>
        <RoleItems />
      </Select>
      <Select items={ROLES} defaultValue='member' readOnly>
        <SelectTrigger aria-label='Role, read-only'>
          <SelectValue />
        </SelectTrigger>
        <RoleItems />
      </Select>
      <Select items={ROLES} defaultValue='member' disabled>
        <SelectTrigger aria-label='Role, disabled'>
          <SelectValue />
        </SelectTrigger>
        <RoleItems />
      </Select>
    </div>
  );
}

import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select';

const PROJECTS: ReadonlyArray<SelectOption> = [
  'Atlas',
  'Beacon',
  'Comet',
  'Delta',
  'Harbor',
  'Orbit',
  'Pioneer',
  'Summit',
].map((name) => ({ value: name.toLowerCase(), label: name }));

/** Loading (`emptyText` while the items load), invalid, disabled. */
export function SearchSelectStates() {
  const common = { onValueChange: () => undefined, placeholder: 'Choose a project' };
  return (
    <div className='grid w-64 gap-2'>
      <SearchSelect {...common} aria-label='Project, loading' items={[]} value={null} emptyText='Loading projects…' />
      <SearchSelect {...common} aria-label='Project, invalid' items={PROJECTS} value={null} aria-invalid />
      <SearchSelect {...common} aria-label='Project, disabled' items={PROJECTS} value='beacon' disabled />
    </div>
  );
}

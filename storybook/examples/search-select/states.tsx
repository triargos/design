import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select-option';

const CLASSES: ReadonlyArray<SelectOption> = ['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b'].map((name) => ({
  value: name,
  label: `Klasse ${name}`,
}));

/** `pending` while the items load, `invalid`, `disabled`. */
export function SearchSelectStates() {
  const common = {
    itemKey: (option: SelectOption) => option.value,
    itemLabel: (option: SelectOption) => option.label,
    onValueChange: () => undefined,
    placeholder: 'Klasse wählen',
  };
  return (
    <div className='grid w-64 gap-2'>
      <SearchSelect {...common} items={[]} value={null} pending />
      <SearchSelect {...common} items={CLASSES} value={null} invalid />
      <SearchSelect {...common} items={CLASSES} value='2b' disabled />
    </div>
  );
}

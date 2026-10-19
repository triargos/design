import { OptionSelect } from '~/components/ui/option-select';
import type { SelectOption } from '~/components/ui/select-option';

const GRADES: ReadonlyArray<SelectOption> = [
  { value: '5', label: 'Klasse 5' },
  { value: '6', label: 'Klasse 6' },
  { value: '7', label: 'Klasse 7' },
];

/** Placeholder, invalid, disabled, `size='sm'`; `aria-label` where no label is visible. */
export function OptionSelectStates() {
  const common = {
    items: GRADES,
    itemKey: (option: SelectOption) => option.value,
    itemLabel: (option: SelectOption) => option.label,
    onValueChange: () => undefined,
    placeholder: 'Klasse wählen',
  };
  return (
    <div className='grid w-56 gap-2'>
      <OptionSelect {...common} value={null} aria-label='Klasse' />
      <OptionSelect {...common} value={null} invalid aria-label='Klasse, ungültig' />
      <OptionSelect {...common} value='6' disabled aria-label='Klasse, deaktiviert' />
      <OptionSelect {...common} value='6' size='sm' aria-label='Klasse, klein' />
    </div>
  );
}

import { OptionSelect } from '~/components/ui/option-select';
import type { SelectOption } from '~/components/ui/select';

const PRIORITIES: ReadonlyArray<SelectOption> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

/** Placeholder, invalid, disabled, `size='sm'`; `aria-label` where no label is visible. */
export function OptionSelectStates() {
  const common = { items: PRIORITIES, onValueChange: () => undefined, placeholder: 'Choose a priority' };
  return (
    <div className='grid w-56 gap-2'>
      <OptionSelect {...common} value={null} aria-label='Priority' />
      <OptionSelect {...common} value={null} aria-invalid aria-label='Priority, invalid' />
      <OptionSelect {...common} value='medium' disabled aria-label='Priority, disabled' />
      <OptionSelect {...common} value='medium' size='sm' aria-label='Priority, small' />
    </div>
  );
}

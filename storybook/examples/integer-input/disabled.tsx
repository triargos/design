import { IntegerStepper } from '~/components/ui/integer-input';

export function IntegerInputDisabled() {
  return <IntegerStepper value={14} onChange={() => undefined} unit='Tage' disabled aria-label='Frist in Tagen' />;
}

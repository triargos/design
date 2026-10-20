import { IntegerInput } from '~/components/ui/integer-input';

export function IntegerInputDisabled() {
  return <IntegerInput value={30} onValueChange={() => undefined} unit='days' disabled aria-label='Payment terms' />;
}

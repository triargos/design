import { Stat, StatLabel, StatValue } from '~/components/ui/stat';

/** The label names the number; the value takes the title role with tabular figures. */
export function StatDefault() {
  return (
    <Stat>
      <StatLabel>Open tasks</StatLabel>
      <StatValue>128</StatValue>
    </Stat>
  );
}

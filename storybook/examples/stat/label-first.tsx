import { Stat, StatLabel, StatValue } from '~/components/ui/stat';

/** Children render in reading order. */
export function StatLabelFirst() {
  return (
    <Stat>
      <StatLabel>Neu in 30 Tagen</StatLabel>
      <StatValue>+12</StatValue>
    </Stat>
  );
}

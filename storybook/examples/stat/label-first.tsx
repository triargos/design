import { Stat, StatLabel, StatValue } from '~/components/ui/stat';

/** Children render in reading order. */
export function StatLabelFirst() {
  return (
    <Stat>
      <StatLabel>New in 30 days</StatLabel>
      <StatValue>+12</StatValue>
    </Stat>
  );
}

import { Stat, StatLabel, StatValue } from '~/components/ui/stat';

export function StatDefault() {
  return (
    <Stat>
      <StatValue>248</StatValue>
      <StatLabel>Open tasks</StatLabel>
    </Stat>
  );
}

import { Stat, StatLabel, StatValue } from '~/components/ui/stat';

export function StatEndAligned() {
  return (
    <div className='flex gap-8'>
      <Stat className='items-end'>
        <StatValue>+12</StatValue>
        <StatLabel>30 days</StatLabel>
      </Stat>
      <Stat className='items-end'>
        <StatValue>+4</StatValue>
        <StatLabel>7 days</StatLabel>
      </Stat>
    </div>
  );
}

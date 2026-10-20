import { Stat, StatLabel, StatValue } from '~/components/ui/stat';
import { StatusDot } from '~/components/ui/status-dot';

export function StatWithASeriesDot() {
  return (
    <div className='flex gap-8'>
      <Stat>
        <StatLabel>
          <StatusDot intent='success' />
          Paid
        </StatLabel>
        <StatValue>186</StatValue>
      </Stat>
      <Stat>
        <StatLabel>
          <StatusDot intent='warning' />
          Due
        </StatLabel>
        <StatValue>41</StatValue>
      </Stat>
    </div>
  );
}

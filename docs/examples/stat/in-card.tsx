import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Stat, StatLabel, StatValue } from '~/components/ui/stat';

const STATS = [
  { label: 'Paid', value: '$12,480' },
  { label: 'Outstanding', value: '$3,150' },
  { label: 'Overdue', value: '$640' },
];

/** Stats side by side in a card; tabular figures keep the amounts aligned. */
export function StatInCard() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Invoices this quarter</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-3 gap-group p-card'>
        {STATS.map((stat) => (
          <Stat key={stat.label}>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </Stat>
        ))}
      </CardContent>
    </Card>
  );
}

import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Stat, StatLabel, StatValue } from '~/components/ui/stat';
import { StatusDot } from '~/components/ui/status-dot';

const STATS = [
  { label: 'Aktiv', value: 186, intent: 'success' },
  { label: 'Inaktiv', value: 41, intent: 'warning' },
  { label: 'Nie angemeldet', value: 21, intent: 'neutral' },
] as const;

export function StatInACard() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Anmeldeaktivität</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='grid grid-cols-3 gap-group p-group'>
        {STATS.map((stat) => (
          <Stat key={stat.label}>
            <StatLabel>
              <StatusDot intent={stat.intent} />
              <span className='truncate'>{stat.label}</span>
            </StatLabel>
            <StatValue>{stat.value}</StatValue>
          </Stat>
        ))}
      </InsetCardContent>
    </InsetCard>
  );
}

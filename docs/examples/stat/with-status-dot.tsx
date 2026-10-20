import type { Intent } from '~/components/ui/intent-variants';
import { Stat, StatLabel, StatValue } from '~/components/ui/stat';
import { StatusDot } from '~/components/ui/status-dot';

const SEGMENTS = [
  { label: 'On track', value: 14, intent: 'success', bar: 'bg-success' },
  { label: 'At risk', value: 5, intent: 'warning', bar: 'bg-warning' },
  { label: 'Not started', value: 3, intent: 'neutral', bar: 'bg-faint-foreground' },
] as const satisfies ReadonlyArray<{ label: string; value: number; intent: Intent; bar: string }>;

/** A `StatusDot` in each label ties the number to its segment of the bar. */
export function StatWithStatusDot() {
  const total = SEGMENTS.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className='flex w-full max-w-md flex-col gap-group'>
      <div className='grid grid-cols-3 gap-group'>
        {SEGMENTS.map((segment) => (
          <Stat key={segment.label}>
            <StatLabel>
              <StatusDot intent={segment.intent} />
              <span className='truncate'>{segment.label}</span>
            </StatLabel>
            <StatValue>{segment.value}</StatValue>
          </Stat>
        ))}
      </div>
      <div aria-hidden className='flex h-1.5 gap-0.5'>
        {SEGMENTS.map((segment) => (
          <div
            key={segment.label}
            className={`rounded-full ${segment.bar}`}
            style={{ flexGrow: segment.value / total }}
          />
        ))}
      </div>
    </div>
  );
}

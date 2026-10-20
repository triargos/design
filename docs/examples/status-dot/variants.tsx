import { StatusDot } from '~/components/ui/status-dot';

const STATES = [
  { intent: 'neutral', label: 'Draft' },
  { intent: 'primary', label: 'Selected' },
  { intent: 'info', label: 'In review' },
  { intent: 'success', label: 'Done' },
  { intent: 'warning', label: 'Blocked' },
  { intent: 'destructive', label: 'Overdue' },
] as const;

export function StatusDotVariants() {
  return (
    <div className='flex flex-wrap items-center gap-4 text-body'>
      {STATES.map(({ intent, label }) => (
        <span key={intent} className='flex items-center gap-1.5'>
          <StatusDot intent={intent} />
          {label}
        </span>
      ))}
    </div>
  );
}

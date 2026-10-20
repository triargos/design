import { Badge } from '~/components/ui/badge';

/** Task labels with the colors the workspace picked in its settings: data, not an intent. */
const LABELS = [
  { name: 'Design', color: '#8b5cf6' },
  { name: 'Backend', color: '#0ea5e9' },
  { name: 'Marketing', color: '#f97316' },
  { name: 'Legal', color: '#64748b' },
] as const;

export function BadgeDataColor() {
  return (
    <div className='flex flex-col gap-2'>
      {(['subtle', 'solid', 'outline'] as const).map((emphasis) => (
        <div key={emphasis} className='flex flex-wrap items-center gap-2'>
          {LABELS.map((label) => (
            <Badge key={label.name} color={label.color} emphasis={emphasis}>
              {label.name}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}

import { StatusDot } from '~/components/ui/status-dot';

export function StatusDotVariants() {
  return (
    <div className='flex flex-wrap items-center gap-4 text-body'>
      <span className='flex items-center gap-1.5'>
        <StatusDot intent='neutral' />
        Entwurf
      </span>
      <span className='flex items-center gap-1.5'>
        <StatusDot intent='primary' />
        Ausgewählt
      </span>
      <span className='flex items-center gap-1.5'>
        <StatusDot intent='info' />
        Neu
      </span>
      <span className='flex items-center gap-1.5'>
        <StatusDot intent='success' />
        Genehmigt
      </span>
      <span className='flex items-center gap-1.5'>
        <StatusDot intent='warning' />
        Ausstehend
      </span>
      <span className='flex items-center gap-1.5'>
        <StatusDot intent='destructive' />
        Abgelehnt
      </span>
    </div>
  );
}

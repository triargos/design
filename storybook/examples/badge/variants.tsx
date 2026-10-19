import { Badge } from '~/components/ui/badge';

/** An intent at subtle (the default); solid when it needs action, outline in dense lists. */
export function BadgeVariants() {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge intent='neutral'>Entwurf</Badge>
        <Badge intent='primary'>Ausgewählt</Badge>
        <Badge intent='info'>Neu</Badge>
        <Badge intent='success'>Genehmigt</Badge>
        <Badge intent='warning'>Ausstehend</Badge>
        <Badge intent='destructive'>Abgelehnt</Badge>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge intent='warning' emphasis='solid'>
          Aktion nötig
        </Badge>
        <Badge intent='neutral' emphasis='outline'>
          Archiviert
        </Badge>
      </div>
    </div>
  );
}

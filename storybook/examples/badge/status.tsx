import { Badge } from '~/components/ui/badge';

/** The old `variant` names keep their pill shape and height until the app migrates. */
export function BadgeStatus() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge variant='success'>Genehmigt</Badge>
      <Badge variant='warning'>Ausstehend</Badge>
      <Badge variant='info'>Neu</Badge>
      <Badge variant='danger'>Abgelehnt</Badge>
      <Badge variant='muted'>Entwurf</Badge>
    </div>
  );
}

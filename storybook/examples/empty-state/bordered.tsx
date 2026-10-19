import { EmptyState, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';

/** A dashed edge, for an empty area on the page itself, not in a card. */
export function EmptyStateBordered() {
  return (
    <EmptyState bordered className='w-full max-w-xl'>
      <EmptyStateTitle>Noch keine Gruppen</EmptyStateTitle>
      <EmptyStateDescription>Lege die erste Gruppe an, um Mitglieder zu ordnen.</EmptyStateDescription>
    </EmptyState>
  );
}

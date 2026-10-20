import { EmptyState, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';

/** A dashed edge, for an empty area on the page itself, not in a card. */
export function EmptyStateBordered() {
  return (
    <EmptyState bordered className='w-full max-w-xl'>
      <EmptyStateTitle>No projects yet</EmptyStateTitle>
      <EmptyStateDescription>Create a project to group tasks and documents.</EmptyStateDescription>
    </EmptyState>
  );
}

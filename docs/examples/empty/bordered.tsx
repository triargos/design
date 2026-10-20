import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';

/** A dashed edge, for an empty area on the page itself, not in a card. */
export function EmptyBordered() {
  return (
    <Empty bordered className='w-full max-w-xl'>
      <EmptyMedia />
      <EmptyTitle>No projects yet</EmptyTitle>
      <EmptyDescription>Create a project to group tasks and documents.</EmptyDescription>
    </Empty>
  );
}

import { EmptyState, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** `EmptyState size='sm'` in the content. */
export function InsetCardEmpty() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Documents</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent>
        <EmptyState size='sm'>
          <EmptyStateTitle>No documents yet</EmptyStateTitle>
          <EmptyStateDescription>Uploaded documents show up here.</EmptyStateDescription>
        </EmptyState>
      </InsetCardContent>
    </InsetCard>
  );
}

import { EmptyState, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** `EmptyState size='sm'` in the content. */
export function InsetCardEmpty() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Dokumente</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent>
        <EmptyState size='sm'>
          <EmptyStateTitle>Noch keine Dokumente</EmptyStateTitle>
          <EmptyStateDescription>Hochgeladene Dokumente erscheinen hier.</EmptyStateDescription>
        </EmptyState>
      </InsetCardContent>
    </InsetCard>
  );
}

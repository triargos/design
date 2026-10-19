import { EmptyState, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { InsetCard, InsetCardContent } from '~/components/ui/inset-card';

/** `sm` for a section inside a card. */
export function EmptyStateSizes() {
  return (
    <div className='grid w-full max-w-2xl gap-4 sm:grid-cols-2'>
      <InsetCard>
        <InsetCardContent className='p-4'>
          <EmptyState>
            <EmptyStateTitle>Keine Termine</EmptyStateTitle>
            <EmptyStateDescription>Termine der Schule erscheinen hier.</EmptyStateDescription>
          </EmptyState>
        </InsetCardContent>
      </InsetCard>
      <InsetCard>
        <InsetCardContent className='p-4'>
          <EmptyState size='sm'>
            <EmptyStateTitle>Keine Termine</EmptyStateTitle>
            <EmptyStateDescription>Termine der Schule erscheinen hier.</EmptyStateDescription>
          </EmptyState>
        </InsetCardContent>
      </InsetCard>
    </div>
  );
}

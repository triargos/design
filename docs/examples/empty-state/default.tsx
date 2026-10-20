import { UploadIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** In a card: a skeleton stack, a title, one line, one action. */
export function EmptyStateDefault() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Documents</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-4'>
        <EmptyState>
          <EmptyStateTitle>No documents yet</EmptyStateTitle>
          <EmptyStateDescription>Uploaded documents show up here, ready to share with the team.</EmptyStateDescription>
          <EmptyStateContent>
            <Button>
              <UploadIcon data-icon='inline-start' />
              Upload documents
            </Button>
          </EmptyStateContent>
        </EmptyState>
      </InsetCardContent>
    </InsetCard>
  );
}

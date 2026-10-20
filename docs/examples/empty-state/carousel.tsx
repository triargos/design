import { ImageIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** For media: the skeleton fans out as a carousel. */
export function EmptyStateCarousel() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Images</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-4'>
        <EmptyState variant='carousel'>
          <EmptyStateTitle>No images yet</EmptyStateTitle>
          <EmptyStateDescription>Images attached to tasks in this project show up here.</EmptyStateDescription>
          <EmptyStateContent>
            <Button>
              <ImageIcon data-icon='inline-start' />
              Add image
            </Button>
          </EmptyStateContent>
        </EmptyState>
      </InsetCardContent>
    </InsetCard>
  );
}

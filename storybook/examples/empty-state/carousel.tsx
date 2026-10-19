import { ImageIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** For media: the skeleton fans out as a carousel. */
export function EmptyStateCarousel() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Dateien</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-4'>
        <EmptyState variant='carousel'>
          <EmptyStateTitle>Noch keine Fotos</EmptyStateTitle>
          <EmptyStateDescription>
            Fotos aus deinen Gruppen erscheinen hier, sobald jemand sie teilt.
          </EmptyStateDescription>
          <EmptyStateContent>
            <Button type='button' intent='neutral' emphasis='raised'>
              <ImageIcon data-icon='inline-start' />
              Foto teilen
            </Button>
          </EmptyStateContent>
        </EmptyState>
      </InsetCardContent>
    </InsetCard>
  );
}

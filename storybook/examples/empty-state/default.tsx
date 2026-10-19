import { UploadIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** In a card: a skeleton stack, a title, one line, one action. */
export function EmptyStateDefault() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Dateien</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-4'>
        <EmptyState>
          <EmptyStateTitle>Noch keine Dateien</EmptyStateTitle>
          <EmptyStateDescription>
            Hochgeladene Dateien erscheinen hier, bereit zum Teilen und Ordnen.
          </EmptyStateDescription>
          <EmptyStateContent>
            <Button type='button' intent='neutral' emphasis='raised'>
              <UploadIcon data-icon='inline-start' />
              Dateien hochladen
            </Button>
          </EmptyStateContent>
        </EmptyState>
      </InsetCardContent>
    </InsetCard>
  );
}

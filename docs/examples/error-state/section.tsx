import { CircleAlertIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  ErrorState,
  ErrorStateActions,
  ErrorStateDescription,
  ErrorStateIcon,
  ErrorStateTitle,
} from '~/components/ui/error-state';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** `size='section'`: centered inside a card, for a part of the page that failed. */
export function ErrorStateSection() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Recent activity</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent>
        <ErrorState size='section'>
          <ErrorStateIcon>
            <CircleAlertIcon />
          </ErrorStateIcon>
          <ErrorStateTitle>Something went wrong</ErrorStateTitle>
          <ErrorStateDescription>This section couldn’t be loaded.</ErrorStateDescription>
          <ErrorStateActions>
            <Button>Try again</Button>
          </ErrorStateActions>
        </ErrorState>
      </InsetCardContent>
    </InsetCard>
  );
}

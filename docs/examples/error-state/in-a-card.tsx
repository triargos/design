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

export function ErrorStateInACard() {
  return (
    <InsetCard className='w-full max-w-2xl'>
      <InsetCardHeader>
        <InsetCardTitle>Tasks</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-4'>
        <ErrorState>
          <ErrorStateIcon>
            <CircleAlertIcon />
          </ErrorStateIcon>
          <ErrorStateTitle>Something went wrong</ErrorStateTitle>
          <ErrorStateDescription>The tasks couldn’t be loaded. Try again.</ErrorStateDescription>
          <ErrorStateActions>
            <Button intent='primary'>Try again</Button>
          </ErrorStateActions>
        </ErrorState>
      </InsetCardContent>
    </InsetCard>
  );
}

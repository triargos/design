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
        <InsetCardTitle>Anmeldungen</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-4'>
        <ErrorState>
          <ErrorStateIcon>
            <CircleAlertIcon />
          </ErrorStateIcon>
          <ErrorStateTitle>Etwas ist schiefgelaufen</ErrorStateTitle>
          <ErrorStateDescription>Die Seite konnte nicht geladen werden. Versuche es erneut.</ErrorStateDescription>
          <ErrorStateActions>
            <Button type='button'>Erneut versuchen</Button>
          </ErrorStateActions>
        </ErrorState>
      </InsetCardContent>
    </InsetCard>
  );
}

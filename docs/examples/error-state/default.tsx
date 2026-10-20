import { CloudOffIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  ErrorState,
  ErrorStateActions,
  ErrorStateDescription,
  ErrorStateIcon,
  ErrorStateTitle,
} from '~/components/ui/error-state';

/** Page size: reads like the page it replaces, left-aligned. */
export function ErrorStateDefault() {
  return (
    <ErrorState>
      <ErrorStateIcon>
        <CloudOffIcon />
      </ErrorStateIcon>
      <ErrorStateTitle>Can’t reach the server</ErrorStateTitle>
      <ErrorStateDescription>
        Your projects couldn’t be loaded. Your work is saved; try again in a few minutes.
      </ErrorStateDescription>
      <ErrorStateActions>
        <Button intent='primary'>Try again</Button>
        <Button>Back to projects</Button>
      </ErrorStateActions>
    </ErrorState>
  );
}

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
      <ErrorStateTitle>Datenquelle nicht erreichbar</ErrorStateTitle>
      <ErrorStateDescription>
        Die Angaben aus der Schulverwaltung konnten nicht geladen werden. Versuche es in ein paar Minuten erneut.
      </ErrorStateDescription>
      <ErrorStateActions>
        <Button type='button'>Erneut versuchen</Button>
        <Button type='button' intent='neutral' emphasis='raised'>
          Zurück zur Anmeldung
        </Button>
      </ErrorStateActions>
    </ErrorState>
  );
}

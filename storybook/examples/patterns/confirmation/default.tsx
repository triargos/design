import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/**
 * A destructive action outside a danger zone: destructive/subtle opens the AlertDialog, destructive/solid confirms,
 * a toast reports it.
 */
export function ConfirmationDefault() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button intent='destructive' emphasis='subtle' />}>
        Ankündigung löschen…
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ankündigung löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Eltern sehen sie nicht mehr. Gelesen-Status und Antworten gehen verloren.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            intent='destructive'
            emphasis='solid'
            onClick={() => toast.success('Ankündigung gelöscht')}>
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

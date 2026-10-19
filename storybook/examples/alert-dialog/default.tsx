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

/** The header is the card, the actions sit on the shell; no close button. */
export function AlertDialogDefault() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button />}>Anmeldung einreichen</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anmeldung einreichen?</AlertDialogTitle>
          <AlertDialogDescription>
            Danach kannst du die Angaben nur noch über das Sekretariat ändern.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction>Einreichen</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

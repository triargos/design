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

/** Opened by a destructive/subtle button; confirmed by destructive/solid. */
export function AlertDialogDestructive() {
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
          <AlertDialogAction intent='destructive' emphasis='solid'>
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

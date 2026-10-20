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
import { toast } from '~/components/ui/toast';

/**
 * A destructive action outside a danger zone: destructive/subtle opens the AlertDialog, destructive/solid confirms,
 * a toast reports it.
 */
export function ConfirmationDefault() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button intent='destructive' emphasis='subtle' />}>
        Delete document…
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete document?</AlertDialogTitle>
          <AlertDialogDescription>Members lose access to it. Its comments and history are lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction intent='destructive' onClick={() => toast.success('Document deleted')}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

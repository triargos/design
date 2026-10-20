import { Button } from '~/components/ui/button';
import { Alert, AlertAction, AlertContent } from '~/components/ui/alert';

export function AlertWithAction() {
  return (
    <div className='flex w-full max-w-lg flex-col gap-2'>
      <Alert intent='destructive'>
        <AlertContent>
          <p className='font-medium'>Sync failed</p>
          <p>3 documents could not be uploaded.</p>
        </AlertContent>
        <AlertAction>
          <Button>Try again</Button>
        </AlertAction>
      </Alert>
      <Alert>
        <AlertContent>4 members joined this week.</AlertContent>
        <AlertAction>
          <Button>View</Button>
        </AlertAction>
      </Alert>
    </div>
  );
}

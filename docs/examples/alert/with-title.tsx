import { Alert, AlertContent } from '~/components/ui/alert';

/** Title and body lines sit flush; the title is font-medium and keeps the intent color. */
export function AlertWithTitle() {
  return (
    <Alert intent='warning' className='max-w-md'>
      <AlertContent>
        <p className='font-medium'>Your trial ends on March 31</p>
        <p>Add a payment method to keep your projects.</p>
      </AlertContent>
    </Alert>
  );
}

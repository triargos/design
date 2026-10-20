import { Alert, AlertContent } from '~/components/ui/alert';

export function AlertDefault() {
  return (
    <Alert className='max-w-md'>
      <AlertContent>Members see the new fields after their next sign-in.</AlertContent>
    </Alert>
  );
}

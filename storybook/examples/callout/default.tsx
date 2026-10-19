import { Callout, CalloutContent } from '~/components/ui/callout';

export function CalloutDefault() {
  return (
    <Callout className='max-w-md'>
      <CalloutContent>Eltern sehen die Änderungen ab dem nächsten Schuljahr.</CalloutContent>
    </Callout>
  );
}

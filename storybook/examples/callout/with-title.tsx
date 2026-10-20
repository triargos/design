import { Callout, CalloutContent } from '~/components/ui/callout';

/** Title and body lines sit flush; the title is font-medium and keeps the intent color. */
export function CalloutWithTitle() {
  return (
    <Callout intent='warning' className='max-w-md'>
      <CalloutContent>
        <p className='font-medium'>Your trial ends on March 31</p>
        <p>Add a payment method to keep your projects.</p>
      </CalloutContent>
    </Callout>
  );
}

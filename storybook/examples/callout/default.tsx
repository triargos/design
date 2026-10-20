import { Callout, CalloutContent } from '~/components/ui/callout';

export function CalloutDefault() {
  return (
    <Callout className='max-w-md'>
      <CalloutContent>Members see the new fields after their next sign-in.</CalloutContent>
    </Callout>
  );
}

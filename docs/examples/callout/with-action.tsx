import { Button } from '~/components/ui/button';
import { Callout, CalloutAction, CalloutContent } from '~/components/ui/callout';

export function CalloutWithAction() {
  return (
    <div className='flex w-full max-w-lg flex-col gap-2'>
      <Callout intent='destructive'>
        <CalloutContent>
          <p className='font-medium'>Sync failed</p>
          <p>3 documents could not be uploaded.</p>
        </CalloutContent>
        <CalloutAction>
          <Button>Try again</Button>
        </CalloutAction>
      </Callout>
      <Callout>
        <CalloutContent>4 members joined this week.</CalloutContent>
        <CalloutAction>
          <Button>View</Button>
        </CalloutAction>
      </Callout>
    </div>
  );
}

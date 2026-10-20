import { Callout, CalloutContent } from '~/components/ui/callout';

const INTENTS = [
  { intent: 'info', title: 'New fields available', body: 'Members see them after their next sign-in.' },
  { intent: 'success', title: 'Import finished', body: '248 tasks were added to the project.' },
  { intent: 'warning', title: 'Your trial ends on March 31', body: 'Add a payment method to keep your projects.' },
  { intent: 'destructive', title: 'Sync failed', body: '3 documents could not be uploaded.' },
  { intent: 'neutral', title: 'Only admins see this section', body: 'Members cannot open it.' },
] as const;

export function CalloutVariants() {
  return (
    <div className='flex w-full max-w-md flex-col gap-2'>
      {INTENTS.map(({ intent, title, body }) => (
        <Callout key={intent} intent={intent}>
          <CalloutContent>
            <p className='font-medium'>{title}</p>
            <p>{body}</p>
          </CalloutContent>
        </Callout>
      ))}
    </div>
  );
}

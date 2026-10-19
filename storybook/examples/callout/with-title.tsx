import { Callout, CalloutContent } from '~/components/ui/callout';

/** Title and body lines sit flush; the title is font-medium and keeps the intent color. */
export function CalloutWithTitle() {
  return (
    <Callout intent='warning' className='max-w-md'>
      <CalloutContent>
        <p className='font-medium'>Frist bis 31. März</p>
        <p>Danach können Eltern keine Anträge mehr stellen.</p>
      </CalloutContent>
    </Callout>
  );
}

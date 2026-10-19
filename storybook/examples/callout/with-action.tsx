import { Button } from '~/components/ui/button';
import { Callout, CalloutAction, CalloutContent } from '~/components/ui/callout';

export function CalloutWithAction() {
  return (
    <div className='flex w-full max-w-lg flex-col gap-2'>
      <Callout intent='destructive'>
        <CalloutContent>
          <p className='font-medium'>Synchronisierung fehlgeschlagen</p>
          <p>3 Dateien konnten nicht übertragen werden.</p>
        </CalloutContent>
        <CalloutAction>
          <Button type='button' intent='neutral' emphasis='raised'>
            Erneut versuchen
          </Button>
        </CalloutAction>
      </Callout>
      <Callout>
        <CalloutContent>Es gibt 4 neue Anmeldungen.</CalloutContent>
        <CalloutAction>
          <Button type='button' intent='neutral' emphasis='raised'>
            Ansehen
          </Button>
        </CalloutAction>
      </Callout>
    </div>
  );
}

import { Callout, CalloutContent } from '~/components/ui/callout';

const INTENTS = [
  { intent: 'info', title: 'Neue Felder verfügbar', body: 'Eltern sehen die Änderungen ab dem nächsten Schuljahr.' },
  { intent: 'success', title: 'Import abgeschlossen', body: '248 Familien wurden übernommen.' },
  { intent: 'warning', title: 'Frist bis 31. März', body: 'Danach können Eltern keine Anträge mehr stellen.' },
  {
    intent: 'destructive',
    title: 'Synchronisierung fehlgeschlagen',
    body: '3 Dateien konnten nicht übertragen werden.',
  },
  { intent: 'neutral', title: 'Nur für die Schulleitung sichtbar', body: 'Lehrkräfte sehen diesen Bereich nicht.' },
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

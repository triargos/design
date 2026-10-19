import { Textarea } from '~/components/ui/textarea';

export function TextareaTall() {
  return (
    <Textarea
      rows={6}
      aria-label='Nachricht'
      className='w-96'
      defaultValue={
        'Liebe Eltern,\n\nder Elternabend der Klasse 5a beginnt am Donnerstag um 19 Uhr in Raum 104.\n\nViele Grüße\nErika Mustermann'
      }
    />
  );
}

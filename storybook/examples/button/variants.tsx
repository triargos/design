import { Button } from '~/components/ui/button';

/** The five pairs the app uses: main action, every other action, quiet action, irreversible, opens a confirmation. */
export function ButtonVariants() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button'>Speichern</Button>
      <Button type='button' intent='neutral' emphasis='raised'>
        Abbrechen
      </Button>
      <Button type='button' intent='neutral' emphasis='ghost'>
        Überspringen
      </Button>
      <Button type='button' intent='destructive' emphasis='solid'>
        Endgültig löschen
      </Button>
      <Button type='button' intent='destructive' emphasis='subtle'>
        Löschen…
      </Button>
    </div>
  );
}

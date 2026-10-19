import { Button } from '~/components/ui/button';

export function ButtonDisabled() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button' disabled>
        Speichern
      </Button>
      <Button type='button' intent='neutral' emphasis='raised' disabled>
        Abbrechen
      </Button>
      <Button type='button' intent='neutral' emphasis='ghost' disabled>
        Überspringen
      </Button>
    </div>
  );
}

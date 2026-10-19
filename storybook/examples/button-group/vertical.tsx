import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';

export function ButtonGroupVertical() {
  return (
    <ButtonGroup orientation='vertical'>
      <Button type='button' intent='neutral' emphasis='raised' size='sm'>
        Nach oben
      </Button>
      <Button type='button' intent='neutral' emphasis='raised' size='sm'>
        Nach unten
      </Button>
      <Button type='button' intent='neutral' emphasis='raised' size='sm'>
        Entfernen
      </Button>
    </ButtonGroup>
  );
}

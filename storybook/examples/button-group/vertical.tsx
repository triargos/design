import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';

export function ButtonGroupVertical() {
  return (
    <ButtonGroup orientation='vertical'>
      <Button size='sm'>Move up</Button>
      <Button size='sm'>Move down</Button>
      <Button size='sm'>Remove</Button>
    </ButtonGroup>
  );
}

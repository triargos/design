import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';

export function ButtonGroupVertical() {
  return (
    <ButtonGroup orientation='vertical'>
      <Button>Move up</Button>
      <Button>Move down</Button>
      <Button>Remove</Button>
    </ButtonGroup>
  );
}

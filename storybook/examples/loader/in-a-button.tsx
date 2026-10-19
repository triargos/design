import { Button } from '~/components/ui/button';

/** In a button use `isLoading`, not a Loader child: the label keeps the width. */
export function LoaderInAButton() {
  return (
    <Button type='button' intent='neutral' emphasis='raised' isLoading>
      Speichern
    </Button>
  );
}

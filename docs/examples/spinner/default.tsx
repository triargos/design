import { Spinner } from '~/components/ui/spinner';

/** The spinner alone, in currentColor; give it a text level. Still with reduced motion. */
export function LoaderDefault() {
  return (
    <span className='text-muted-foreground'>
      <Spinner />
    </span>
  );
}

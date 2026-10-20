import { Loader } from '~/components/ui/loader';

/** The spinner alone, in currentColor; give it a text level. Still with reduced motion. */
export function LoaderDefault() {
  return (
    <span className='text-muted-foreground'>
      <Loader />
    </span>
  );
}

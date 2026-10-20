import { Textarea } from '~/components/ui/textarea';

/** At least 60px; grows with `rows`. */
export function TextareaDefault() {
  return <Textarea placeholder='Add a comment' aria-label='Comment' className='w-96' />;
}

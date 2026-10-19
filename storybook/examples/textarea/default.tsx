import { Textarea } from '~/components/ui/textarea';

/** At least 60px; grows with `rows`. */
export function TextareaDefault() {
  return <Textarea placeholder='Nachricht an die Eltern' aria-label='Nachricht' className='w-96' />;
}

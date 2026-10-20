import { Textarea } from '~/components/ui/textarea';

export function TextareaTall() {
  return (
    <Textarea
      rows={6}
      aria-label='Project brief'
      className='w-96'
      defaultValue={
        'Goal: ship the new pricing page by the end of the quarter.\n\nScope: copy, layout and the checkout link.\n\nOut of scope: billing changes.'
      }
    />
  );
}

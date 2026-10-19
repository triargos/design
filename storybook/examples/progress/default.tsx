import { Progress } from '~/components/ui/progress';

/** Known progress, like an upload: a 4px track, the brand fill for what is done. */
export function ProgressDefault() {
  return <Progress value={35} aria-label='Upload' className='w-80' />;
}

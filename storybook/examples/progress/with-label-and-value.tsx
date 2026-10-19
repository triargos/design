import { Progress, ProgressLabel, ProgressValue } from '~/components/ui/progress';

export function ProgressWithLabelAndValue() {
  return (
    <Progress value={35} className='w-80'>
      <ProgressLabel>Zeugnis.pdf</ProgressLabel>
      <ProgressValue />
    </Progress>
  );
}

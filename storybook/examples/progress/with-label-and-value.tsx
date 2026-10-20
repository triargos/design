import { Progress, ProgressLabel, ProgressValue } from '~/components/ui/progress';

export function ProgressWithLabelAndValue() {
  return (
    <Progress value={35} className='w-80'>
      <ProgressLabel>invoice-march.pdf</ProgressLabel>
      <ProgressValue />
    </Progress>
  );
}

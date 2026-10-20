import { StepperSkeleton } from '~/components/ui/skeleton';

/** `StepperSkeleton`: the stepper while its steps load. */
export function SkeletonStepper() {
  return <StepperSkeleton steps={3} withDescription className='w-full max-w-xl' />;
}

import { StepperSkeleton } from '~/components/ui/skeleton';

/** `StepperSkeleton`: the stepper while its steps load. */
export function SkeletonStepper() {
  return <StepperSkeleton size={3} withDescription className='w-full max-w-xl' />;
}

import { Stepper, StepperItem, StepperTitle } from '~/components/ui/stepper';

const STEPS = ['Create project', 'Invite members', 'Add tasks'] as const;

/** `loading`: the active step's indicator spins. */
export function StepperLoading() {
  return (
    <Stepper value={2} isLoading aria-label='Project setup' className='w-full max-w-xl'>
      {STEPS.map((title, index) => (
        <StepperItem key={title} step={index + 1}>
          <StepperTitle>{title}</StepperTitle>
        </StepperItem>
      ))}
    </Stepper>
  );
}

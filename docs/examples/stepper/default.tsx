import { Stepper, StepperItem, StepperTitle } from '~/components/ui/stepper';

const STEPS = ['Create project', 'Invite members', 'Add tasks'] as const;

/** Done steps: a check on the brand fill and a brand connector. Active: the subtle brand fill. Later: quiet and muted. */
export function StepperDefault() {
  return (
    <Stepper value={2} aria-label='Project setup' className='w-full max-w-xl'>
      {STEPS.map((title, index) => (
        <StepperItem key={title} step={index + 1}>
          <StepperTitle>{title}</StepperTitle>
        </StepperItem>
      ))}
    </Stepper>
  );
}

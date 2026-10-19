import { Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTitle } from '~/components/ui/stepper';

const STEPS = ['App installieren', 'Code scannen', 'Code eingeben'] as const;

/** `loading` on the active step: the indicator spins. */
export function StepperLoading() {
  return (
    <Stepper value={2} aria-label='Zwei-Faktor einrichten' className='w-full max-w-xl'>
      {STEPS.map((title, index) => (
        <StepperItem key={title} step={index + 1} loading>
          <StepperIndicator />
          <StepperTitle>{title}</StepperTitle>
          <StepperSeparator />
        </StepperItem>
      ))}
    </Stepper>
  );
}

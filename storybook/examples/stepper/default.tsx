import { Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTitle } from '~/components/ui/stepper';

const STEPS = ['App installieren', 'Code scannen', 'Code eingeben'] as const;

/** Done steps: a check on the brand fill and a brand connector. Active: the subtle brand fill. Later: quiet and muted. */
export function StepperDefault() {
  return (
    <Stepper value={2} aria-label='Zwei-Faktor einrichten' className='w-full max-w-xl'>
      {STEPS.map((title, index) => (
        <StepperItem key={title} step={index + 1}>
          <StepperIndicator />
          <StepperTitle>{title}</StepperTitle>
          <StepperSeparator />
        </StepperItem>
      ))}
    </Stepper>
  );
}

import { Stepper, StepperDescription, StepperItem, StepperTitle } from '~/components/ui/stepper';

const EXPORT = [
  { title: 'Export requested', description: 'March 3, 2025' },
  { title: 'Confirmed', description: 'By email link' },
  { title: 'Archive ready', description: 'April 2, 2025 at 10:00 AM' },
] as const;

/** `value` past the last step: every step done. */
export function StepperDone() {
  return (
    <Stepper value={4} orientation='vertical' aria-label='Workspace export'>
      {EXPORT.map((step, index) => (
        <StepperItem key={step.title} step={index + 1}>
          <StepperTitle>{step.title}</StepperTitle>
          <StepperDescription>{step.description}</StepperDescription>
        </StepperItem>
      ))}
    </Stepper>
  );
}

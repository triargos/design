import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from '~/components/ui/stepper';

const DELETION = [
  { title: 'Löschung beantragt', description: 'Am 3. März 2025' },
  { title: 'Bestätigt', description: 'Per E-Mail-Link' },
  { title: 'Konto wird gelöscht', description: 'Am 2. April 2025 um 10:00' },
] as const;

/** `value` past the last step: every step done. */
export function StepperDone() {
  return (
    <Stepper value={4} orientation='vertical' aria-label='Fortschritt der Löschung'>
      {DELETION.map((step, index) => (
        <StepperItem key={step.title} step={index + 1}>
          <StepperIndicator />
          <StepperContent>
            <StepperTitle>{step.title}</StepperTitle>
            <StepperDescription>{step.description}</StepperDescription>
          </StepperContent>
          <StepperSeparator />
        </StepperItem>
      ))}
    </Stepper>
  );
}

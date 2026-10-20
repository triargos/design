import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';

const QUESTIONS = [
  {
    value: 'invite',
    question: 'How do I invite a teammate?',
    answer: 'Open Members, choose Invite and enter their email. They join as soon as they accept.',
  },
  {
    value: 'documents',
    question: 'Where do shared documents live?',
    answer: 'Every project has a Documents tab; files open right in the browser.',
  },
  {
    value: 'billing',
    question: 'How do I change the billing email?',
    answer: 'Under Settings → Billing. Invoices go to the new address from the next cycle.',
  },
] as const;

/** One open at a time; the first one open. */
export function AccordionDefault() {
  return (
    <Accordion defaultValue={['invite']} className='max-w-md'>
      {QUESTIONS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

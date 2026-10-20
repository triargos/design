import { useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';

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

export function AccordionControlled() {
  const [open, setOpen] = useState<ReadonlyArray<string>>([]);
  const allOpen = open.length === QUESTIONS.length;
  return (
    <div className='flex max-w-md flex-col items-start gap-2'>
      <Button size='sm' onClick={() => setOpen(allOpen ? [] : QUESTIONS.map((item) => item.value))}>
        {allOpen ? 'Close all' : 'Open all'}
      </Button>
      <Accordion
        multiple
        value={[...open]}
        onValueChange={(value) => setOpen(value.map((item) => String(item)))}
        className='w-full'>
        {QUESTIONS.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

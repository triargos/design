import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Card, CardContent } from '~/components/ui/card';

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

/** Rows that paint to the card edge: the item drops its pb-1, the trigger and content set their own padding. */
export function AccordionFullBleedRows() {
  return (
    <Card className='w-full max-w-md'>
      <CardContent className='overflow-hidden'>
        <Accordion defaultValue={['documents']}>
          {QUESTIONS.map((item) => (
            <AccordionItem key={item.value} value={item.value} className='pb-0'>
              <AccordionTrigger className='items-center rounded-none px-4 py-2.5 transition-colors duration-feedback hover:bg-row-hover'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='border-t border-border-subtle bg-muted/20 px-4 py-2.5'>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

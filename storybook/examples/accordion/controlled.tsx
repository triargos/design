import { useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';

const QUESTIONS = [
  {
    value: 'sick',
    question: 'Wie melde ich mein Kind krank?',
    answer:
      'Unter Abwesenheiten auf „Neue Abwesenheit“ tippen, Kind und Grund wählen, absenden. Die Schule sieht es sofort.',
  },
  {
    value: 'documents',
    question: 'Wo finde ich Elternbriefe?',
    answer: 'Alle Nachrichten der Schule liegen im Posteingang; Anhänge öffnen sich direkt im Browser.',
  },
  {
    value: 'contact',
    question: 'Wie ändere ich meine Telefonnummer?',
    answer: 'Unter Konto → Profil. Die Schule bestätigt die Änderung, bevor sie gilt.',
  },
] as const;

export function AccordionControlled() {
  const [open, setOpen] = useState<ReadonlyArray<string>>([]);
  const allOpen = open.length === QUESTIONS.length;
  return (
    <div className='flex max-w-md flex-col items-start gap-2'>
      <Button
        type='button'
        intent='neutral'
        emphasis='raised'
        size='sm'
        onClick={() => setOpen(allOpen ? [] : QUESTIONS.map((item) => item.value))}>
        {allOpen ? 'Alle schließen' : 'Alle öffnen'}
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

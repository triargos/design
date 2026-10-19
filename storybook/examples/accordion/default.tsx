import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';

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

/** One open at a time; the first one open. */
export function AccordionDefault() {
  return (
    <Accordion defaultValue={['sick']} className='max-w-md'>
      {QUESTIONS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

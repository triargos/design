import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

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

export function AccordionInACard() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Häufige Fragen</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-2'>
        <Accordion defaultValue={['sick']}>
          {QUESTIONS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </InsetCardContent>
    </InsetCard>
  );
}

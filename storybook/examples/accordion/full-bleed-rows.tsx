import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { InsetCard, InsetCardContent } from '~/components/ui/inset-card';

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

/** Rows that paint to the card edge: the item drops its pb-1, the trigger and content set their own padding. */
export function AccordionFullBleedRows() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardContent className='overflow-hidden'>
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
      </InsetCardContent>
    </InsetCard>
  );
}

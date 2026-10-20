import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '~/components/ui/timeline';

const ENTRIES = [
  { date: '3. März', title: 'Anmeldung eingereicht', body: 'Mia Schmidt für die Einschulung 2025.' },
  { date: '5. März', title: 'Unterlagen geprüft', body: 'Geburtsurkunde und Impfnachweis vollständig.' },
  { date: '12. März', title: 'Zusage verschickt', body: 'Per E-Mail an beide Erziehungsberechtigte.' },
  { date: 'offen', title: 'Einschulung', body: 'Am 1. September um 9 Uhr in der Aula.' },
] as const;

/** `value={3}`: three steps reached. Reached steps take the brand edge and line. */
export function TimelineDefault() {
  return (
    <Timeline value={3} orientation='vertical' className='max-w-md'>
      {ENTRIES.map((entry, index) => (
        <TimelineItem key={entry.title} step={index + 1}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineDate>{entry.date}</TimelineDate>
            <TimelineTitle>{entry.title}</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>{entry.body}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

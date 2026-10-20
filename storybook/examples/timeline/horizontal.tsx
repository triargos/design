import { Timeline, TimelineContent, TimelineDate, TimelineItem, TimelineTitle } from '~/components/ui/timeline';

const ENTRIES = [
  { date: 'March 3', title: 'Project created', body: 'Jordan Lee started Website redesign.' },
  { date: 'March 5', title: 'Brief approved', body: 'Scope and budget signed off by the team.' },
  { date: 'March 12', title: 'Design review', body: 'Homepage and pricing pages reviewed.' },
  { date: 'Upcoming', title: 'Launch', body: 'Planned for June 30.' },
] as const;

export function TimelineHorizontal() {
  return (
    <Timeline value={3} orientation='horizontal' className='w-full max-w-3xl'>
      {ENTRIES.map((entry, index) => (
        <TimelineItem key={entry.title} step={index + 1}>
          <TimelineDate>{entry.date}</TimelineDate>
          <TimelineTitle>{entry.title}</TimelineTitle>
          <TimelineContent>{entry.body}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

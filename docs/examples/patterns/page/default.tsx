import { IconChevronLeft, IconPlus } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/**
 * A page: a back link, the title row with its actions, then sections. The header sits `page` above the content,
 * sections sit `section` apart, and a section title is indented to the text of the cards below it.
 */
export function PagePatternDefault() {
  return (
    <div className='flex w-full max-w-3xl flex-col gap-page'>
      <header className='flex flex-col gap-group'>
        <a
          href='#projects'
          className='inline-flex min-h-6 items-center gap-1.5 self-start text-body text-muted-foreground transition-colors hover:text-foreground'>
          <IconChevronLeft aria-hidden className='size-4' />
          Projects
        </a>
        <div className='flex flex-wrap items-start justify-between gap-group'>
          <hgroup className='flex flex-col gap-tight'>
            <h1 className='text-title text-balance'>Website redesign</h1>
            <p className='max-w-prose text-body text-pretty text-muted-foreground'>
              Everything the team ships for the new site this quarter.
            </p>
          </hgroup>
          <div className='flex flex-wrap items-center gap-related'>
            <Button>Share</Button>
            <Button intent='primary'>
              <IconPlus data-icon='inline-start' />
              New task
            </Button>
          </div>
        </div>
      </header>
      <div className='flex flex-col gap-section'>
        {[
          { title: 'Tasks', description: 'What is due this week.', card: 'Due today' },
          { title: 'Team', description: 'Only admins see these details.', card: 'Members' },
        ].map((section) => (
          <section key={section.title} className='flex flex-col gap-group'>
            {/* Card shell 4px + the card's 1px edge + its `group` padding: the title starts on the cards' text. */}
            <hgroup className='flex flex-col gap-tight px-[calc(--spacing(1)+1px+var(--spacing-group))]'>
              <h2 className='text-heading text-balance'>{section.title}</h2>
              <p className='text-body text-pretty text-muted-foreground'>{section.description}</p>
            </hgroup>
            <Card>
              <CardHeader>
                <CardTitle>{section.card}</CardTitle>
              </CardHeader>
              <CardContent className='h-16' />
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}

import { IconCalendarOff, IconFolder, IconId, IconMail, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { BottomNav, BottomNavLink, BottomNavList } from '~/components/ui/bottom-nav';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';
import { cn } from '~/lib/utils';

const TABS = [
  { label: 'Inbox', icon: <IconMail /> },
  { label: 'Absences', icon: <IconCalendarOff /> },
  { label: 'Family', icon: <IconId /> },
  { label: 'Documents', icon: <IconFolder /> },
] as const;

const DAYS = [
  { day: 'Tue', date: '3', state: 'today' },
  { day: 'Wed', date: '4', state: 'absent' },
  { day: 'Thu', date: '5', state: 'absent' },
  { day: 'Fri', date: '6', state: 'absent' },
  { day: 'Sat', date: '7', state: 'weekend' },
  { day: 'Sun', date: '8', state: 'weekend' },
] as const;

const HISTORY = [
  { child: 'Lilli', when: 'Thu, 22 Oct · all day', reason: 'Medical appointment', excused: false },
  { child: 'Theo', when: 'Tue, 13 Oct · 08:00–10:00', reason: 'Medical appointment', excused: true },
  { child: 'Lilli', when: 'Wed, 7 Oct · 08:00–10:00', reason: 'Medical appointment', excused: true },
  { child: 'Lilli', when: 'Fri, 25 Sept · all day', reason: 'Sick', excused: true },
] as const;

/**
 * A parent's absences screen on a phone, built only from components and roles: no size, radius or face of its own,
 * so the sizing style and `--font-display` around it decide the look. The lead card is `Card size='lg'`; the bottom
 * nav floats as a pill with labels. `absolute md:grid` keeps the nav in this frame at desktop width.
 */
export function AbsencesScreen() {
  const [child, setChild] = useState('all');
  const [page, setPage] = useState('Absences');
  const go = (label: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setPage(label);
  };
  const history = HISTORY.filter((row) => child === 'all' || row.child.toLowerCase() === child);

  return (
    <div className='relative h-[844px] w-[390px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50'>
      <div className='h-full overflow-y-auto px-group pt-page pb-36'>
        <div className='flex flex-col gap-group'>
          <header className='flex flex-col gap-related'>
            <div className='flex items-center justify-between gap-group'>
              <p className='text-caption text-muted-foreground'>Tuesday, 3 November</p>
              <Button emphasis='ghost' size='icon' aria-label='Profile and settings'>
                <Avatar size='2xl'>
                  <AvatarFallback>TZ</AvatarFallback>
                </Avatar>
              </Button>
            </div>
            <h1 className='text-title text-balance'>{page}</h1>
          </header>

          <TabsRadioGroup aria-label='Child' value={child} onValueChange={setChild} className='self-start'>
            <TabsRadio value='all'>All</TabsRadio>
            <TabsRadio value='lilli'>Lilli</TabsRadio>
            <TabsRadio value='theo'>Theo</TabsRadio>
          </TabsRadioGroup>

          <Card size='lg' aria-labelledby='current-absence'>
            <CardContent className='flex flex-col gap-group p-card'>
              <div className='flex items-start justify-between gap-part'>
                <hgroup className='flex flex-col gap-tight'>
                  <p className='text-caption text-muted-foreground'>Absent now</p>
                  <h2 id='current-absence' className='text-heading text-balance'>
                    Lilli is off sick until Sunday
                  </h2>
                </hgroup>
                <Badge intent='primary' shape='pill'>
                  Day 1 of 4
                </Badge>
              </div>
              <p className='text-body text-muted-foreground'>Medical appointment · 3–8 Nov</p>
              <ol aria-label='Days' className='grid grid-cols-6 gap-related'>
                {DAYS.map(({ day, date, state }) => (
                  <li
                    key={day}
                    aria-current={state === 'today' ? 'date' : undefined}
                    className={cn(
                      'flex flex-col items-center gap-tight rounded-block py-related',
                      state === 'today' && 'bg-primary-solid text-primary-solid-foreground',
                      state === 'absent' && 'bg-muted',
                      state === 'weekend' && 'border border-dashed border-border-strong text-muted-foreground',
                    )}>
                    <span className='text-caption'>{day}</span>
                    <span className='text-heading tabular-nums'>{date}</span>
                  </li>
                ))}
              </ol>
              <div className='grid grid-cols-2 gap-related'>
                <Button size='lg'>Extend</Button>
                <Button size='lg' intent='primary'>
                  Back to school
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button size='lg' className='w-full'>
            <IconPlus data-icon='inline-start' />
            Report an absence
          </Button>

          <Card>
            <CardHeader
              actions={
                <Button size='sm' emphasis='ghost'>
                  Show all
                </Button>
              }>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <ItemList>
                {history.map((row) => (
                  <Item key={`${row.child}-${row.when}`}>
                    <ItemMedia>
                      <Avatar size='2xl'>
                        <AvatarFallback>{row.child[0]}</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{row.when}</ItemTitle>
                      <ItemDescription>
                        {row.child} · {row.reason}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      {row.excused ? (
                        <Badge intent='success'>Excused</Badge>
                      ) : (
                        <Badge intent='warning'>Note missing</Badge>
                      )}
                    </ItemActions>
                  </Item>
                ))}
              </ItemList>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav className='absolute md:grid'>
        <BottomNavList labels fill>
          {TABS.map((tab) => (
            <BottomNavLink key={tab.label} href='#' current={page === tab.label} onClick={go(tab.label)}>
              {tab.icon}
              <span>{tab.label}</span>
            </BottomNavLink>
          ))}
        </BottomNavList>
      </BottomNav>
    </div>
  );
}

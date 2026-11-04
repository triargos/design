import {
  IconCalendar,
  IconCheck,
  IconDownload,
  IconEdit,
  IconFileText,
  IconMapPin,
  IconPaperclip,
  IconPlus,
  IconSearch,
  IconUpload,
} from '@tabler/icons-react';
import { useState } from 'react';

import { Alert, AlertAction, AlertContent } from '~/components/ui/alert';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import {
  Item,
  ItemActions,
  ItemChevron,
  ItemContent,
  ItemDescription,
  ItemList,
  ItemMedia,
  ItemTitle,
} from '~/components/ui/item';
import { Stat, StatLabel, StatValue } from '~/components/ui/stat';
import { StatusDot } from '~/components/ui/status-dot';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';
import { cn } from '~/lib/utils';

import {
  ANNOUNCEMENTS,
  CHILDREN,
  HeaderAction,
  ListLabel,
  type Navigation,
  ScreenHeader,
  ScreenScroll,
} from './shared';

const DAYS = [
  { day: 'Tue', date: '3', state: 'today' },
  { day: 'Wed', date: '4', state: 'absent' },
  { day: 'Thu', date: '5', state: 'absent' },
  { day: 'Fri', date: '6', state: 'absent' },
  { day: 'Sat', date: '7', state: 'weekend' },
  { day: 'Sun', date: '8', state: 'weekend' },
] as const;

/** A link row's props: an `<a>` that stays on the page. */
const rowLink = (onClick?: () => void) => (
  // oxlint-disable-next-line jsx-a11y/anchor-is-valid -- an example row: the link goes nowhere.
  <a
    href='#'
    onClick={(event) => {
      event.preventDefault();
      onClick?.();
    }}
  />
);

/**
 * Today: the current absence on the inverse surface (the nav's dark), reporting a child sick, what needs doing, and
 * the latest announcements. Once everyone is back, the lead card offers a quick report for each child instead.
 */
export function TodayScreen({
  nav,
  sick,
  setSick,
}: {
  nav: Navigation;
  sick: boolean;
  setSick: (sick: boolean) => void;
}) {
  return (
    <ScreenScroll>
      <ScreenHeader title='Hello, Tim' meta='Tuesday, 3 November' onProfile={() => nav.open('profile')} />

      {sick ? (
        <>
          <section
            data-surface='inverse'
            aria-labelledby='today-absence'
            className='flex flex-col gap-group rounded-card-lg bg-popover p-card text-popover-foreground shadow-card'>
            <div className='flex items-center justify-between gap-part'>
              <p className='flex items-center gap-related text-caption font-medium text-muted-foreground'>
                <StatusDot intent='warning' />
                Absent now
              </p>
              <Badge shape='pill'>Day 1 of 4</Badge>
            </div>
            <hgroup className='flex flex-col gap-tight'>
              <h2 id='today-absence' className='text-heading text-balance'>
                Lilli is off sick until Sunday
              </h2>
              <p className='text-body text-muted-foreground'>Doctor’s appointment · Tue, 3 – Sun, 8 Nov</p>
            </hgroup>
            <ol aria-label='Days' className='grid grid-cols-6 gap-related'>
              {DAYS.map(({ day, date, state }) => (
                <li
                  key={day}
                  aria-current={state === 'today' ? 'date' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-tight rounded-block py-related',
                    state === 'today' && 'bg-neutral-solid text-neutral-solid-foreground',
                    state === 'absent' && 'bg-muted',
                    state === 'weekend' && 'border border-dashed border-border-strong text-muted-foreground',
                  )}>
                  <span className='text-caption font-medium'>{day}</span>
                  <span className='text-heading tabular-nums'>{date}</span>
                </li>
              ))}
            </ol>
            <div className='grid grid-cols-2 gap-related'>
              <Button size='lg' intent='neutral' emphasis='solid'>
                Extend
              </Button>
              <Button size='lg' onClick={() => setSick(false)}>
                Back to school
              </Button>
            </div>
          </section>

          <Card>
            <CardContent className='overflow-hidden'>
              <Item render={<button type='button' onClick={() => nav.open('report')} />} className='text-start'>
                <ItemContent>
                  <ItemTitle className='text-heading'>Report a child sick</ItemTitle>
                  <ItemDescription>For today or several days</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <span
                    aria-hidden
                    className='flex size-control-lg items-center justify-center rounded-full bg-neutral-solid text-neutral-solid-foreground [&_svg]:size-icon-lg'>
                    <IconPlus />
                  </span>
                </ItemActions>
              </Item>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card size='lg'>
          <CardContent className='flex flex-col gap-group p-card'>
            <div className='flex items-center gap-part'>
              <span
                aria-hidden
                className='flex size-control-lg shrink-0 items-center justify-center rounded-full bg-success-subtle text-success-subtle-foreground [&_svg]:size-icon-lg'>
                <IconCheck />
              </span>
              <hgroup className='flex flex-col gap-tight'>
                <h2 className='text-heading'>Everyone is at school</h2>
                <p className='text-caption text-muted-foreground'>No absence running</p>
              </hgroup>
            </div>
            <div className='flex flex-col gap-related'>
              <p className='text-caption font-medium text-muted-foreground'>Report sick for today</p>
              <div className='grid grid-cols-2 gap-related'>
                {CHILDREN.map((child) => (
                  <Button key={child.id} size='lg' className='justify-start' onClick={() => nav.open('report')}>
                    <Avatar size='lg'>
                      <AvatarFallback>{child.name[0]}</AvatarFallback>
                    </Avatar>
                    {child.name}
                  </Button>
                ))}
              </div>
              <Button emphasis='ghost' className='self-start' onClick={() => nav.open('report')}>
                <IconCalendar data-icon='inline-start' />
                Another day or range
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert intent='warning'>
        <AlertContent>
          <p className='font-medium'>Doctor’s note missing</p>
          <p>Lilli · Thu, 22 Oct</p>
        </AlertContent>
        <AlertAction>
          <Button intent='neutral' emphasis='solid'>
            Upload
          </Button>
        </AlertAction>
      </Alert>

      <Card>
        <CardHeader
          actions={
            <Button size='sm' emphasis='ghost' onClick={() => nav.go('announcements')}>
              All
            </Button>
          }>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className='overflow-hidden'>
          <ItemList>
            {ANNOUNCEMENTS.map((announcement) => (
              <Item key={announcement.id} render={rowLink(() => nav.go('announcement'))}>
                <ItemContent>
                  <p className='flex items-center gap-related text-caption text-muted-foreground'>
                    {announcement.unread && <StatusDot intent='primary' aria-label='Unread' role='img' />}
                    {announcement.date}
                  </p>
                  <ItemTitle>{announcement.title}</ItemTitle>
                  <ItemDescription className='truncate'>{announcement.preview}</ItemDescription>
                </ItemContent>
                <ItemChevron />
              </Item>
            ))}
          </ItemList>
        </CardContent>
      </Card>
    </ScreenScroll>
  );
}

const ABSENCES = [
  { child: 'Lilli', month: 'Current', when: 'Tue, 3 – Sun, 8 Nov', status: 'Running', intent: 'info' },
  { child: 'Lilli', month: 'October 2026', when: 'Thu, 22 Oct · all day', status: 'Note missing', intent: 'warning' },
  { child: 'Theo', month: 'October 2026', when: 'Tue, 13 Oct · 08:00–10:00', status: 'Excused', intent: 'success' },
  { child: 'Lilli', month: 'October 2026', when: 'Wed, 7 Oct · 08:00–10:00', status: 'Excused', intent: 'success' },
  { child: 'Lilli', month: 'September 2026', when: 'Fri, 25 Sept · all day', status: 'Excused', intent: 'success' },
] as const;

const STATS = [
  { child: 'Lilli', value: '6', unit: 'days', meta: '+ 2 hrs since September' },
  { child: 'Theo', value: '2', unit: 'hrs', meta: 'since September' },
] as const;

/** Absences: filter by child, the totals since the term began, then every absence by month. */
export function AbsencesScreen({ nav, sick }: { nav: Navigation; sick: boolean }) {
  const [child, setChild] = useState('all');
  const shown = (name: string) => child === 'all' || name.toLowerCase() === child;
  const rows = ABSENCES.filter((row) => shown(row.child) && (sick || row.month !== 'Current'));
  const months = [...new Set(rows.map((row) => row.month))];

  return (
    <ScreenScroll>
      <ScreenHeader
        title='Absences'
        actions={
          <HeaderAction label='Report a child sick' onClick={() => nav.open('report')}>
            <IconPlus />
          </HeaderAction>
        }
        onProfile={() => nav.open('profile')}
      />
      <TabsRadioGroup aria-label='Child' value={child} onValueChange={setChild}>
        <TabsRadio value='all'>All</TabsRadio>
        {CHILDREN.map((c) => (
          <TabsRadio key={c.id} value={c.id}>
            {c.name}
          </TabsRadio>
        ))}
      </TabsRadioGroup>
      <div className='grid grid-cols-2 gap-part'>
        {STATS.filter((stat) => shown(stat.child)).map((stat) => (
          <Card key={stat.child}>
            <CardContent className='p-card'>
              <Stat>
                <StatLabel className='font-medium text-foreground'>{stat.child}</StatLabel>
                <StatValue className='flex items-baseline gap-tight'>
                  {stat.value}
                  <span className='text-body font-medium'>{stat.unit}</span>
                </StatValue>
                <StatLabel>{stat.meta}</StatLabel>
              </Stat>
            </CardContent>
          </Card>
        ))}
      </div>
      {months.map((month) => (
        <section key={month} className='flex flex-col gap-related'>
          <ListLabel>{month}</ListLabel>
          <Card>
            <CardContent className='overflow-hidden'>
              <ItemList>
                {rows
                  .filter((row) => row.month === month)
                  .map((row) => (
                    <Item key={row.when} render={rowLink()}>
                      <ItemMedia>
                        <Avatar size='2xl'>
                          <AvatarFallback>{row.child[0]}</AvatarFallback>
                        </Avatar>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className='tabular-nums'>{row.when}</ItemTitle>
                        <ItemDescription>{row.child} · Doctor’s appointment</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Badge intent={row.intent}>{row.status}</Badge>
                      </ItemActions>
                    </Item>
                  ))}
              </ItemList>
            </CardContent>
          </Card>
        </section>
      ))}
    </ScreenScroll>
  );
}

const THREADS = [
  {
    initials: 'KL',
    name: 'Lilli’s class teacher',
    time: '18:02',
    preview: 'Thanks for letting us know, get well soon!',
    unread: true,
  },
  {
    initials: 'SO',
    name: 'School office',
    time: '19 Oct',
    preview: 'The school certificate is under Documents.',
    unread: true,
  },
  {
    initials: 'KT',
    name: 'Theo’s class teacher',
    time: '8 Oct',
    preview: 'Parents’ evening: the date will follow.',
    unread: false,
  },
] as const;

/** Messages: search, then every conversation, unread ones heavier with a dot. */
export function MessagesScreen({ nav }: { nav: Navigation }) {
  return (
    <ScreenScroll>
      <ScreenHeader
        title='Messages'
        actions={
          <HeaderAction label='New message'>
            <IconEdit />
          </HeaderAction>
        }
        onProfile={() => nav.open('profile')}
      />
      <InputGroup>
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
        <InputGroupInput type='search' placeholder='Search messages' aria-label='Search messages' />
      </InputGroup>
      <Card>
        <CardContent className='overflow-hidden'>
          <ItemList>
            {THREADS.map((thread) => (
              <Item key={thread.name} render={rowLink()}>
                <ItemMedia>
                  <Avatar size='3xl'>
                    <AvatarFallback>{thread.initials}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <div className='flex items-baseline justify-between gap-related'>
                    <ItemTitle className={cn(!thread.unread && 'font-normal')}>{thread.name}</ItemTitle>
                    <span className='shrink-0 text-caption text-muted-foreground'>{thread.time}</span>
                  </div>
                  <div className='flex items-center gap-related'>
                    <ItemDescription className='min-w-0 flex-1 truncate'>{thread.preview}</ItemDescription>
                    {thread.unread && <StatusDot intent='primary' role='img' aria-label='Unread' />}
                  </div>
                </ItemContent>
              </Item>
            ))}
          </ItemList>
        </CardContent>
      </Card>
    </ScreenScroll>
  );
}

const DOCUMENTS = [
  { month: 'October 2026', title: 'School certificate 2026', meta: 'Lilli · 19 Oct' },
  { month: 'October 2026', title: 'School certificate 2026', meta: 'Lilli · 6 Oct' },
  { month: 'March 2026', title: 'School certificate 2026', meta: 'Lilli · 10 Mar' },
  { month: 'January 2026', title: 'School notice', meta: 'All children · 23 Jan' },
] as const;

/** Documents: what the school sent, by month, and what the parent uploaded (none yet). */
export function DocumentsScreen({ nav }: { nav: Navigation }) {
  const [view, setView] = useState('school');
  const months = [...new Set(DOCUMENTS.map((document) => document.month))];

  return (
    <ScreenScroll>
      <ScreenHeader
        title='Documents'
        actions={
          <HeaderAction label='Upload a document'>
            <IconUpload />
          </HeaderAction>
        }
        onProfile={() => nav.open('profile')}
      />
      <TabsRadioGroup variant='segmented' aria-label='View' value={view} onValueChange={setView} className='w-full'>
        <TabsRadio value='school' className='flex-1'>
          From school
        </TabsRadio>
        <TabsRadio value='uploads' className='flex-1'>
          My uploads
        </TabsRadio>
      </TabsRadioGroup>
      {view === 'school' ? (
        months.map((month) => (
          <section key={month} className='flex flex-col gap-related'>
            <ListLabel>{month}</ListLabel>
            <Card>
              <CardContent className='overflow-hidden'>
                <ItemList>
                  {DOCUMENTS.filter((document) => document.month === month).map((document) => (
                    <Item key={document.meta} render={rowLink()}>
                      <ItemMedia variant='icon'>
                        <IconFileText />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{document.title}</ItemTitle>
                        <ItemDescription>{document.meta}</ItemDescription>
                      </ItemContent>
                      <IconDownload aria-hidden className='size-icon shrink-0 text-muted-foreground' />
                    </Item>
                  ))}
                </ItemList>
              </CardContent>
            </Card>
          </section>
        ))
      ) : (
        <Card>
          <CardContent className='p-card'>
            <Empty>
              <EmptyMedia />
              <EmptyTitle>No uploads yet</EmptyTitle>
              <EmptyDescription>Doctor’s notes and forms you upload show up here.</EmptyDescription>
              <EmptyContent>
                <Button intent='primary'>
                  <IconUpload data-icon='inline-start' />
                  Upload a document
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      )}
    </ScreenScroll>
  );
}

/** Family: the children, the guardians and the address; a tap asks the school for a change. */
export function FamilyScreen({ nav }: { nav: Navigation }) {
  return (
    <ScreenScroll>
      <ScreenHeader title='Family' onProfile={() => nav.open('profile')} />
      <div className='grid grid-cols-2 gap-part'>
        {CHILDREN.map((child) => (
          <Card key={child.id}>
            <CardContent className='flex flex-col gap-part p-card'>
              <Avatar size='4xl'>
                <AvatarFallback>{child.name[0]}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col gap-tight'>
                <p className='text-heading'>{child.name}</p>
                <p className='text-caption text-muted-foreground'>{child.born}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <section className='flex flex-col gap-related'>
        <ListLabel>Guardians</ListLabel>
        <Card>
          <CardContent className='overflow-hidden'>
            <Item render={rowLink()}>
              <ItemMedia>
                <Avatar size='2xl'>
                  <AvatarFallback>PA</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Patricia Aalen</ItemTitle>
                <ItemDescription>Mother · born 6 May 1986</ItemDescription>
              </ItemContent>
              <ItemChevron />
            </Item>
          </CardContent>
        </Card>
      </section>
      <section className='flex flex-col gap-related'>
        <ListLabel>Address</ListLabel>
        <Card>
          <CardContent className='overflow-hidden'>
            <Item render={rowLink()}>
              <ItemMedia variant='icon'>
                <IconMapPin />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>99 B Einstein Street</ItemTitle>
                <ItemDescription>76666 Malhausen</ItemDescription>
              </ItemContent>
              <ItemChevron />
            </Item>
          </CardContent>
        </Card>
      </section>
      <p className='px-row-pad-x text-caption text-muted-foreground'>
        No open change requests. Tap an entry to ask for a change.
      </p>
    </ScreenScroll>
  );
}

/** Every announcement, each its own card, under its month; back to Today. */
export function AnnouncementsScreen({ nav }: { nav: Navigation }) {
  return (
    <ScreenScroll>
      <ScreenHeader title='Announcements' back={{ label: 'Today', onClick: () => nav.go('today') }} />
      <ListLabel>October 2026</ListLabel>
      {ANNOUNCEMENTS.map((announcement) => (
        <Card key={announcement.id}>
          <CardContent className='overflow-hidden'>
            <Item render={rowLink(() => nav.go('announcement'))} className='items-start'>
              <ItemContent className='gap-tight'>
                <p className='flex items-center gap-related text-caption text-muted-foreground'>
                  {announcement.unread && <StatusDot intent='primary' role='img' aria-label='Unread' />}
                  {announcement.date}
                </p>
                <ItemTitle className='text-heading'>{announcement.title}</ItemTitle>
                <ItemDescription>{announcement.preview}</ItemDescription>
                {announcement.attachment && (
                  <Badge className='mt-related self-start'>
                    <IconPaperclip />1 attachment
                  </Badge>
                )}
              </ItemContent>
              <ItemChevron />
            </Item>
          </CardContent>
        </Card>
      ))}
    </ScreenScroll>
  );
}

/** One announcement, read in full, with its attachment. */
export function AnnouncementScreen({ nav }: { nav: Navigation }) {
  const announcement = ANNOUNCEMENTS[1];
  return (
    <ScreenScroll>
      <ScreenHeader title={announcement.title} back={{ label: 'Back', onClick: () => nav.go('announcements') }} />
      <p className='-mt-related px-tight text-caption font-medium text-muted-foreground'>
        {announcement.dateLong} · Musterberg Free School
      </p>
      <p className='px-tight text-body'>{announcement.preview}</p>
      <Card>
        <CardContent className='overflow-hidden'>
          <Item render={rowLink()}>
            <ItemMedia variant='icon'>
              <IconFileText />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Open attachment</ItemTitle>
              <ItemDescription>Holiday dates.pdf · 120 KB</ItemDescription>
            </ItemContent>
            <IconDownload aria-hidden className='size-icon shrink-0 text-muted-foreground' />
          </Item>
        </CardContent>
      </Card>
    </ScreenScroll>
  );
}

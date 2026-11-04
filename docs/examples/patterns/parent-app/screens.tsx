import {
  IconChevronRight,
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
import { StatusDot } from '~/components/ui/status-dot';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';
import { cn } from '~/lib/utils';

import {
  ANNOUNCEMENTS,
  CHILD_COLORS,
  CHILDREN,
  ChildAvatar,
  type ChildId,
  childOf,
  HeaderAction,
  ListLabel,
  type Navigation,
  ScreenHeader,
  ScreenScroll,
} from './shared';

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

/** The child filter every list shares: All, then each child with their dot. */
function ChildFilter({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  return (
    <TabsRadioGroup aria-label='Child' value={value} onValueChange={onValueChange}>
      <TabsRadio value='all'>All</TabsRadio>
      {CHILDREN.map((child) => (
        <TabsRadio key={child.id} value={child.id}>
          {child.name}
        </TabsRadio>
      ))}
    </TabsRadioGroup>
  );
}

/**
 * Quick actions, round with a label under: each child first (their initial in their color; a tap opens the report
 * with that child and today chosen, so Send is the only step left), then uploading a note and writing to the school.
 */
function QuickActions({
  nav,
  sick,
  onQuickReport,
}: {
  nav: Navigation;
  sick: boolean;
  onQuickReport: (child: ChildId) => void;
}) {
  const actions = [
    ...CHILDREN.map((child) => ({
      key: child.id,
      label: sick && child.id === 'lilli' ? `Extend ${child.name}` : `${child.name} sick`,
      onClick: () => onQuickReport(child.id),
      icon: <span className='text-heading'>{child.name[0]}</span>,
      tone: CHILD_COLORS[child.id].solid,
    })),
    {
      key: 'upload',
      label: 'Upload note',
      onClick: () => nav.go('documents'),
      icon: <IconUpload />,
      tone: 'bg-card text-foreground shadow-card',
    },
    {
      key: 'message',
      label: 'Message',
      onClick: () => nav.go('messages'),
      icon: <IconEdit />,
      tone: 'bg-card text-foreground shadow-card',
    },
  ];
  return (
    <div role='group' aria-label='Quick actions' className='grid grid-cols-4 gap-related'>
      {actions.map((action) => (
        <button
          key={action.key}
          type='button'
          onClick={action.onClick}
          className='group/quick flex flex-col items-center gap-related rounded-block py-related outline-none focus-visible:ring-3 focus-visible:ring-ring/24'>
          <span
            aria-hidden
            className={cn(
              'flex size-14 items-center justify-center rounded-full transition-[scale] duration-feedback group-active/quick:scale-[0.94] [&_svg]:size-icon-lg',
              action.tone,
            )}>
            {action.icon}
          </span>
          <span className='text-caption font-medium'>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Today: the current absence (or that everyone is at school) as the lead card, a quick report for each child, the
 * latest announcements.
 */
export function TodayScreen({
  nav,
  sick,
  setSick,
  onQuickReport,
}: {
  nav: Navigation;
  sick: boolean;
  setSick: (sick: boolean) => void;
  onQuickReport: (child: ChildId) => void;
}) {
  return (
    <ScreenScroll>
      <ScreenHeader title='Hello, Tim' onProfile={() => nav.open('profile')} />

      {sick ? (
        <>
          <Card size='lg' aria-labelledby='today-absence'>
            <CardContent className='flex flex-col gap-group p-card'>
              <hgroup className='flex flex-col gap-tight'>
                <div className='flex items-start justify-between gap-part'>
                  <h2 id='today-absence' className='text-heading text-balance'>
                    Lilli is off sick until Sunday
                  </h2>
                  <Badge shape='pill'>Day 1 of 4</Badge>
                </div>
                <p className='text-body text-muted-foreground'>Doctor’s appointment · Tue, 3 – Sun, 8 Nov</p>
              </hgroup>
              <div className='grid grid-cols-2 gap-related'>
                <Button size='lg' intent='primary'>
                  Extend
                </Button>
                <Button size='lg' onClick={() => setSick(false)}>
                  Back to school
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card size='lg'>
          <CardContent className='flex flex-col gap-group p-card'>
            <hgroup className='flex flex-col gap-tight'>
              <h2 className='text-heading'>Everyone is at school</h2>
              <p className='text-caption text-muted-foreground'>No absence running</p>
            </hgroup>
          </CardContent>
        </Card>
      )}

      <QuickActions nav={nav} sick={sick} onQuickReport={onQuickReport} />

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
                  <p className='text-caption text-muted-foreground'>{announcement.date}</p>
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
  { child: 'lilli', value: '6', unit: 'days' },
  { child: 'theo', value: '2', unit: 'hrs' },
] as const;

const PRESENCE = [
  { child: 'lilli', absent: 'Off sick · back Mon, 9 Nov' },
  { child: 'theo', absent: null },
] as const;

/**
 * Absences: filter by child, who is at school today, the totals since September, then every absence by month. Each
 * child's color is on their avatar only.
 */
export function AbsencesScreen({ nav, sick }: { nav: Navigation; sick: boolean }) {
  const [child, setChild] = useState('all');
  const shown = (id: string) => child === 'all' || id === child;
  const rows = ABSENCES.filter((row) => shown(childOf(row.child)) && (sick || row.month !== 'Current'));
  const months = [...new Set(rows.map((row) => row.month))];

  return (
    <ScreenScroll>
      <ScreenHeader
        title='Absences'
        actions={
          <HeaderAction label='New absence' onClick={() => nav.open('report')}>
            <IconPlus />
          </HeaderAction>
        }
        onProfile={() => nav.open('profile')}
      />
      <ChildFilter value={child} onValueChange={setChild} />

      <Card size='lg'>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent className='overflow-hidden'>
          <ItemList>
            {PRESENCE.filter((row) => shown(row.child)).map((row) => {
              const absent = row.absent !== null && sick;
              return (
                <Item key={row.child}>
                  <ItemMedia>
                    <ChildAvatar child={row.child} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{CHILDREN.find((c) => c.id === row.child)!.name}</ItemTitle>
                    {absent && <ItemDescription>{row.absent}</ItemDescription>}
                  </ItemContent>
                  <ItemActions>
                    <Badge intent={absent ? 'warning' : 'success'}>{absent ? 'Absent' : 'At school'}</Badge>
                  </ItemActions>
                </Item>
              );
            })}
          </ItemList>
        </CardContent>
      </Card>

      <div className='grid grid-cols-2 gap-part'>
        {STATS.filter((stat) => shown(stat.child)).map((stat) => {
          const name = CHILDREN.find((c) => c.id === stat.child)!.name;
          return (
            <Card key={stat.child}>
              <CardContent className='flex flex-col gap-tight p-card'>
                <p className='text-caption font-medium text-muted-foreground'>{name}</p>
                <p className='flex items-baseline gap-tight'>
                  <span className='text-title tabular-nums'>{stat.value}</span>
                  <span className='text-body font-medium'>{stat.unit}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
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
                        <ChildAvatar child={childOf(row.child)} />
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
    child: 'lilli',
    name: 'Lilli’s class teacher',
    time: '18:02',
    preview: 'Thanks for letting us know, get well soon!',
    unread: true,
  },
  {
    initials: 'SO',
    child: null,
    name: 'School office',
    time: '19 Oct',
    preview: 'The school certificate is under Documents.',
    unread: true,
  },
  {
    initials: 'KT',
    child: 'theo',
    name: 'Theo’s class teacher',
    time: '8 Oct',
    preview: 'Parents’ evening: the date will follow.',
    unread: false,
  },
] as const;

/** Messages: search, then every conversation; a child's teachers in that child's color, unread ones heavier. */
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
                  <Avatar size='2xl' className={thread.child ? CHILD_COLORS[thread.child].avatar : undefined}>
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
  { month: '2025', title: 'School notice', meta: 'All children' },
] as const;

/** Documents: search, what the school sent by month (the child's dot on each), and what the parent uploaded. */
export function DocumentsScreen({ nav }: { nav: Navigation }) {
  const [view, setView] = useState('school');
  const [query, setQuery] = useState('');
  const found = DOCUMENTS.filter((document) =>
    `${document.title} ${document.meta}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const months = [...new Set(found.map((document) => document.month))];

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
      <InputGroup>
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
        <InputGroupInput
          type='search'
          placeholder='Search documents'
          aria-label='Search documents'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>
      <TabsRadioGroup variant='segmented' aria-label='View' value={view} onValueChange={setView} className='w-full'>
        <TabsRadio value='school' className='flex-1'>
          From school
        </TabsRadio>
        <TabsRadio value='uploads' className='flex-1'>
          My uploads
        </TabsRadio>
      </TabsRadioGroup>
      {view === 'school' ? (
        months.length > 0 ? (
          months.map((month) => (
            <section key={month} className='flex flex-col gap-related'>
              <ListLabel>{month}</ListLabel>
              <Card>
                <CardContent className='overflow-hidden'>
                  <ItemList>
                    {found
                      .filter((document) => document.month === month)
                      .map((document) => (
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
          <p className='px-row-pad-x text-body text-muted-foreground'>No documents match “{query.trim()}”.</p>
        )
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

/**
 * Family: each child as a tile in their color, the guardians, the address, and the change requests; a tap asks the
 * school for a change.
 */
export function FamilyScreen({ nav }: { nav: Navigation }) {
  return (
    <ScreenScroll>
      <ScreenHeader title='Family' onProfile={() => nav.open('profile')} />
      <div className='grid grid-cols-2 gap-part'>
        {CHILDREN.map((child) => (
          <Card key={child.id}>
            <CardContent
              render={<button type='button' />}
              className='flex w-full flex-col items-start gap-part p-card text-start'>
              <ChildAvatar child={child.id} />
              <span className='text-heading'>{child.name}</span>
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
                <ItemDescription>Mother</ItemDescription>
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
                <p className='text-caption text-muted-foreground'>{announcement.date}</p>
                <ItemTitle className={cn('text-heading', !announcement.unread && 'font-medium')}>
                  {announcement.title}
                </ItemTitle>
                <ItemDescription className='line-clamp-2'>{announcement.preview}</ItemDescription>
                {announcement.attachment && (
                  <Badge className='mt-related self-start'>
                    <IconPaperclip />1 attachment
                  </Badge>
                )}
              </ItemContent>
              <IconChevronRight aria-hidden className='mt-tight size-icon shrink-0 text-faint-foreground' />
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

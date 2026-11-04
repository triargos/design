import {
  IconChevronRight,
  IconDownload,
  IconEdit,
  IconFileAlert,
  IconFileText,
  IconFileTypePdf,
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
  inCard = false,
}: {
  nav: Navigation;
  sick: boolean;
  onQuickReport: (child: ChildId) => void;
  /** On a card the plain actions sit on `muted`; on the page, on a raised card fill. */
  inCard?: boolean;
}) {
  const plain = inCard ? 'bg-muted text-foreground' : 'bg-card text-foreground shadow-card';
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
      label: 'Upload',
      onClick: () => nav.go('documents'),
      icon: <IconUpload />,
      tone: plain,
    },
    {
      key: 'message',
      label: 'Message',
      onClick: () => nav.go('messages'),
      icon: <IconEdit />,
      tone: plain,
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
 * Today, built from what is there, most urgent first: who is absent (or that everyone is at school, with the quick
 * actions on that card), what needs the parent, unread messages, what is coming up, then announcements. A quiet day
 * keeps only the status and what is coming up, and says so in one line.
 */
export function TodayScreen({
  nav,
  sick,
  setSick,
  quiet,
  onQuickReport,
}: {
  nav: Navigation;
  sick: boolean;
  setSick: (sick: boolean) => void;
  /** A day with nothing open: no note to upload, no unread message, no new announcement. */
  quiet: boolean;
  onQuickReport: (child: ChildId) => void;
}) {
  const unread = THREADS.filter((thread) => thread.unread);
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
          <QuickActions nav={nav} sick={sick} onQuickReport={onQuickReport} />
        </>
      ) : (
        <Card size='lg'>
          <CardContent className='flex flex-col gap-group p-card'>
            <hgroup className='flex flex-col gap-tight'>
              <h2 className='text-heading'>Everyone is at school</h2>
              <p className='text-caption text-muted-foreground'>No absence running</p>
            </hgroup>
            <QuickActions nav={nav} sick={sick} onQuickReport={onQuickReport} inCard />
          </CardContent>
        </Card>
      )}

      {quiet ? (
        <p className='px-row-pad-x py-related text-center text-body text-muted-foreground'>You’re all caught up.</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Needs you</CardTitle>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <Item>
                <ItemMedia variant='icon' className='bg-warning-subtle text-warning-subtle-foreground'>
                  <IconFileAlert />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Doctor’s note for Lilli</ItemTitle>
                  <ItemDescription>Absent Thu, 22 Oct</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button size='sm' intent='neutral' emphasis='solid' onClick={() => nav.go('documents')}>
                    Upload
                  </Button>
                </ItemActions>
              </Item>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              actions={
                <Button size='sm' emphasis='ghost' onClick={() => nav.go('messages')}>
                  All
                </Button>
              }>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <ItemList>
                {unread.map((thread) => (
                  <Item key={thread.name} render={rowLink(() => nav.go('messages'))}>
                    <ItemMedia>
                      <Avatar size='2xl' className={thread.child ? CHILD_COLORS[thread.child].avatar : undefined}>
                        <AvatarFallback>{thread.initials}</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{thread.name}</ItemTitle>
                      <ItemDescription className='truncate'>{thread.preview}</ItemDescription>
                    </ItemContent>
                    <StatusDot intent='primary' role='img' aria-label='Unread' />
                  </Item>
                ))}
              </ItemList>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Coming up</CardTitle>
        </CardHeader>
        <CardContent className='overflow-hidden'>
          <ItemList>
            {COMING_UP.map((event) => (
              <Item key={event.title}>
                <ItemMedia>
                  <span className='flex size-10 flex-col items-center justify-center rounded-block bg-muted leading-none'>
                    <span className='text-caption font-medium text-muted-foreground uppercase'>{event.month}</span>
                    <span className='font-(weight:--control-font-weight) tabular-nums'>{event.day}</span>
                  </span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{event.title}</ItemTitle>
                  <ItemDescription>{event.when}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemList>
        </CardContent>
      </Card>

      {!quiet && (
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
      )}
    </ScreenScroll>
  );
}

const COMING_UP = [
  { month: 'Nov', day: '12', title: 'Parents’ evening', when: 'Thu, 18:00 · School hall' },
  { month: 'Dec', day: '21', title: 'Christmas holidays', when: 'Until Fri, 8 Jan' },
] as const;

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
  { id: 1, month: 'October 2026', title: 'School certificate 2026', child: 'Lilli', date: '19 Oct', size: '120 KB' },
  {
    id: 2,
    month: 'October 2026',
    title: 'Parents’ evening invitation',
    child: 'All children',
    date: '6 Oct',
    size: '84 KB',
  },
  { id: 3, month: 'March 2026', title: 'School certificate 2026', child: 'Lilli', date: '10 Mar', size: '118 KB' },
  { id: 4, month: 'January 2026', title: 'School notice', child: 'All children', date: '23 Jan', size: '56 KB' },
  { id: 5, month: '2025', title: 'School notice', child: 'All children', date: '12 Sept', size: '61 KB' },
] as const;

type SchoolDocument = (typeof DOCUMENTS)[number];

/** A file's type as a tile: the format's icon over its name, so a PDF reads as one at a glance. */
function FileTile({ large = false }: { large?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-block bg-muted text-muted-foreground',
        large ? 'size-12 [&_svg]:size-icon-lg' : 'size-10 [&_svg]:size-icon',
      )}>
      <IconFileTypePdf />
    </span>
  );
}

/** A file in a list: its tile, title, who and when, and a download button at the end. */
function FileRow({ document }: { document: SchoolDocument }) {
  return (
    <Item>
      <ItemMedia>
        <FileTile />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{document.title}</ItemTitle>
        <ItemDescription>
          {document.child} · {document.date} · {document.size}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button emphasis='ghost' size='icon-sm' className='rounded-full' aria-label={`Download ${document.title}`}>
          <IconDownload />
        </Button>
      </ItemActions>
    </Item>
  );
}

/**
 * Documents: search; from school, the two newest as cards and the rest by month as rows, each with its type, who it
 * is for, its date and size, and a download button; what the parent uploaded (none yet).
 */
export function DocumentsScreen({ nav }: { nav: Navigation }) {
  const [view, setView] = useState('school');
  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';
  const found = DOCUMENTS.filter((document) =>
    `${document.title} ${document.child} ${document.date}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const recent = searching ? [] : found.slice(0, 2);
  const rest = searching ? found : found.slice(2);
  const groups = searching
    ? [{ label: 'Results', files: rest }]
    : [...new Set(rest.map((document) => document.month))].map((month) => ({
        label: month,
        files: rest.filter((document) => document.month === month),
      }));

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
        found.length === 0 ? (
          <p className='px-row-pad-x text-body text-muted-foreground'>No documents match “{query.trim()}”.</p>
        ) : (
          <>
            {recent.length > 0 && (
              <div className='grid grid-cols-2 gap-part'>
                {recent.map((document) => (
                  <Card key={document.id}>
                    <CardContent
                      render={<button type='button' />}
                      className='flex w-full flex-col items-start gap-part p-card text-start'>
                      <FileTile large />
                      <span className='flex min-w-0 flex-col gap-tight'>
                        <span className='line-clamp-2 font-(weight:--item-title-font-weight)'>{document.title}</span>
                        <span className='text-caption text-muted-foreground'>
                          {document.child} · {document.date}
                        </span>
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {groups.map((group) => (
              <section key={group.label} className='flex flex-col gap-related'>
                <ListLabel>{group.label}</ListLabel>
                <Card>
                  <CardContent className='overflow-hidden'>
                    <ItemList>
                      {group.files.map((document) => (
                        <FileRow key={document.id} document={document} />
                      ))}
                    </ItemList>
                  </CardContent>
                </Card>
              </section>
            ))}
          </>
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

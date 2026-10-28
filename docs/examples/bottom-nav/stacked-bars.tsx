import {
  IconBriefcase,
  IconBulb,
  IconCheck,
  IconFolder,
  IconHome,
  IconInbox,
  IconMail,
  IconPalette,
  IconSettings,
  IconSquareCheck,
  IconTextSize,
  IconSun,
  IconTrash,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

import { ActionBar } from '~/components/ui/action-bar';
import {
  BottomNav,
  BottomNavLink,
  BottomNavList,
  BottomNavMore,
  BottomNavMoreGroup,
  BottomNavMoreItem,
  BottomNavProvider,
} from '~/components/ui/bottom-nav';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Item, ItemContent, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';
import { Separator } from '~/components/ui/separator';
import { Switch } from '~/components/ui/switch';

const TABS = [
  { label: 'Home', icon: <IconHome /> },
  { label: 'Inbox', icon: <IconInbox /> },
  { label: 'Tasks', icon: <IconSquareCheck /> },
] as const;

type Entry = { readonly label: string; readonly icon: React.ReactNode; readonly children?: readonly Entry[] };

/** "More": two groups, Settings with Appearance inside, three levels deep. */
const MORE: readonly Entry[] = [
  {
    label: 'Projects',
    icon: <IconFolder />,
    children: [
      { label: 'Website redesign', icon: <IconBriefcase /> },
      { label: 'Mobile app', icon: <IconBriefcase /> },
      { label: 'Ideas', icon: <IconBulb /> },
    ],
  },
  {
    label: 'Settings',
    icon: <IconSettings />,
    children: [
      { label: 'Profile', icon: <IconUser /> },
      {
        label: 'Appearance',
        icon: <IconPalette />,
        children: [
          { label: 'Theme', icon: <IconSun /> },
          { label: 'Text size', icon: <IconTextSize /> },
        ],
      },
      { label: 'Invite a friend', icon: <IconMail /> },
    ],
  },
];

const TASKS = [
  { id: '1', title: 'Update pricing page' },
  { id: '2', title: 'Write launch post' },
  { id: '3', title: 'Fix login redirect' },
] as const;

/**
 * Two `ActionBar`s on one page, and "More" with nested groups. Rename the project: "Unsaved changes" docks (`priority={1}`). Select a task meanwhile:
 * the selection waits until the changes are saved or discarded. "Pill bar" sets `--bottom-nav-radius: 9999px`; off,
 * the bar takes the sizing theme's.
 */
export function BottomNavStackedBars() {
  const [page, setPage] = useState('Tasks');
  const [pill, setPill] = useState(true);
  const [saved, setSaved] = useState('Website redesign');
  const [name, setName] = useState(saved);
  const [justSaved, setJustSaved] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const lastCount = useRef(0);
  if (selected.size > 0) lastCount.current = selected.size;
  const dirty = name !== saved;

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 1200);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const clear = () => setSelected(new Set());

  return (
    <BottomNavProvider>
      <div
        className='relative h-[640px] w-[375px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50'
        style={pill ? ({ '--bottom-nav-radius': '9999px' } as React.CSSProperties) : undefined}>
        <div className='flex h-full flex-col gap-page overflow-y-auto px-5 pt-10 pb-24'>
          <h1 className='text-title text-balance'>Project</h1>
          <Field>
            <FieldLabel htmlFor='stacked-bars-name'>Name</FieldLabel>
            <Input id='stacked-bars-name' value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field orientation='horizontal'>
            <FieldLabel htmlFor='stacked-bars-pill'>Pill bar</FieldLabel>
            <Switch id='stacked-bars-pill' checked={pill} onCheckedChange={setPill} />
          </Field>
          <Card>
            <CardContent className='overflow-hidden'>
              <ItemList aria-label='Tasks'>
                {TASKS.map((task) => (
                  <Item key={task.id} selected={selected.has(task.id)} render={<label />}>
                    <ItemMedia>
                      <Checkbox
                        checked={selected.has(task.id)}
                        onCheckedChange={(checked) => toggle(task.id, checked)}
                      />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{task.title}</ItemTitle>
                    </ItemContent>
                  </Item>
                ))}
              </ItemList>
            </CardContent>
          </Card>
          <ActionBar open={selected.size > 0} aria-label='Selection'>
            <span className='ps-2.5 whitespace-nowrap text-muted-foreground tabular-nums'>
              {lastCount.current} selected
            </span>
            <Button emphasis='ghost' size='icon' aria-label='Clear selection' onClick={clear}>
              <IconX />
            </Button>
            <Separator orientation='vertical' className='my-1.5' />
            <Button intent='destructive' emphasis='subtle' size='icon' aria-label='Delete' onClick={clear}>
              <IconTrash />
            </Button>
          </ActionBar>
          <ActionBar
            open={dirty || justSaved}
            priority={1}
            status={
              justSaved ? (
                <>
                  <IconCheck className='text-success' />
                  Saved
                </>
              ) : undefined
            }
            aria-label='Unsaved changes'>
            <span className='ps-2.5 whitespace-nowrap text-muted-foreground'>Unsaved changes</span>
            <Button emphasis='ghost' onClick={() => setName(saved)}>
              Discard
            </Button>
            <Button
              onClick={() => {
                setSaved(name);
                setJustSaved(true);
              }}>
              Save
            </Button>
          </ActionBar>
        </div>
        <BottomNav className='absolute md:grid'>
          <BottomNavList>
            {TABS.map((tab) => (
              <BottomNavLink
                key={tab.label}
                href='#'
                current={page === tab.label}
                onClick={(event) => {
                  event.preventDefault();
                  setPage(tab.label);
                }}>
                {tab.icon}
                <span>{tab.label}</span>
              </BottomNavLink>
            ))}
            <BottomNavMore>
              {MORE.map(function entry(item: Entry): React.ReactNode {
                return item.children ? (
                  <BottomNavMoreGroup key={item.label} label={item.label} icon={item.icon}>
                    {item.children.map(entry)}
                  </BottomNavMoreGroup>
                ) : (
                  <BottomNavMoreItem
                    key={item.label}
                    href='#'
                    current={page === item.label}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(item.label);
                    }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </BottomNavMoreItem>
                );
              })}
            </BottomNavMore>
          </BottomNavList>
        </BottomNav>
      </div>
    </BottomNavProvider>
  );
}

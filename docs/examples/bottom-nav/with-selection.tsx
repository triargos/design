import {
  CheckSquareIcon,
  DownloadIcon,
  HomeIcon,
  InboxIcon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { ActionBar } from '~/components/ui/action-bar';
import {
  BottomNav,
  BottomNavAction,
  BottomNavLink,
  BottomNavList,
  BottomNavProvider,
} from '~/components/ui/bottom-nav';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Item, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';
import { Separator } from '~/components/ui/separator';

const TABS = [
  { label: 'Home', icon: <HomeIcon /> },
  { label: 'Inbox', icon: <InboxIcon /> },
  { label: 'Tasks', icon: <CheckSquareIcon /> },
  { label: 'Settings', icon: <SettingsIcon /> },
] as const;

const TASKS = [
  { id: '1', title: 'Update pricing page', project: 'Website redesign' },
  { id: '2', title: 'Write launch post', project: 'Website redesign' },
  { id: '3', title: 'Fix login redirect', project: 'Mobile app' },
  { id: '4', title: 'Send onboarding emails', project: 'Mobile app' },
  { id: '5', title: 'Review analytics events', project: 'Mobile app' },
] as const;

/**
 * Select a task: the page's `ActionBar` docks in the nav, the tabs and the main action step aside, and clearing brings
 * them back. The same `ActionBar` sticks under the list on a wider screen. `BottomNavProvider` wraps the frame, as it
 * wraps an app shell.
 */
export function BottomNavWithSelection() {
  const [page, setPage] = useState('Tasks');
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const clear = () => setSelected(new Set());
  const lastCount = useRef(0);
  if (selected.size > 0) lastCount.current = selected.size;

  return (
    <BottomNavProvider>
      <div className='relative h-[640px] w-[375px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50'>
        <div className='flex h-full flex-col gap-page overflow-y-auto px-5 pt-10 pb-24'>
          <h1 className='text-title text-balance'>Tasks</h1>
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
                      <ItemDescription>{task.project}</ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemList>
            </CardContent>
          </Card>
          <ActionBar open={selected.size > 0} aria-label='Selection' className='@max-lg:gap-1'>
            <span className='ps-2.5 whitespace-nowrap text-muted-foreground tabular-nums'>
              {lastCount.current} selected
            </span>
            <Button emphasis='ghost' size='icon' aria-label='Clear selection' onClick={clear}>
              <XIcon />
            </Button>
            <Separator orientation='vertical' className='my-1.5' />
            <Button size='icon' aria-label='Export'>
              <DownloadIcon />
            </Button>
            <Button intent='destructive' emphasis='subtle' size='icon' aria-label='Delete' onClick={clear}>
              <Trash2Icon />
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
          </BottomNavList>
          <BottomNavAction aria-label='New task'>
            <PlusIcon />
          </BottomNavAction>
        </BottomNav>
      </div>
    </BottomNavProvider>
  );
}

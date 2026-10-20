import {
  IconCalendar,
  IconFolder,
  IconHome,
  IconInbox,
  IconPlus,
  IconSettings,
  IconSquareCheck,
  IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import {
  BottomNav,
  BottomNavAction,
  BottomNavLink,
  BottomNavList,
  BottomNavMore,
  BottomNavMoreItem,
} from '~/components/ui/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

const TABS = [
  { label: 'Home', icon: <IconHome /> },
  { label: 'Inbox', icon: <IconInbox />, count: 3 },
  { label: 'Tasks', icon: <IconSquareCheck /> },
] as const;

const MORE = [
  { label: 'Calendar', icon: <IconCalendar /> },
  { label: 'Projects', icon: <IconFolder /> },
  { label: 'Members', icon: <IconUsers /> },
  { label: 'Settings', icon: <IconSettings /> },
] as const;

/**
 * A phone frame: the nav floats over the scrolling panel, which keeps `pb-24` to clear it. Three tabs, the main action,
 * and "More": the bar morphs into a list of the rest, and "More" is current while that list holds the page. `absolute
 * md:grid` keeps the nav in this frame at desktop width; an app leaves it `fixed` and hidden from `md` up.
 */
export function BottomNavDefault() {
  const [page, setPage] = useState('Tasks');
  const go = (label: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setPage(label);
  };

  return (
    <div className='relative h-[640px] w-[375px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50'>
      <div className='h-full overflow-y-auto px-5 pt-10 pb-24'>
        <div className='flex flex-col gap-page'>
          <h1 className='text-title text-balance'>{page}</h1>
          {['Due today', 'This week', 'Later'].map((title) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className='h-24' />
            </Card>
          ))}
        </div>
      </div>
      <BottomNav className='absolute md:grid'>
        <BottomNavList>
          {TABS.map((tab) => (
            <BottomNavLink key={tab.label} href='#' current={page === tab.label} onClick={go(tab.label)}>
              {tab.icon}
              <span>{tab.label}</span>
              {'count' in tab && (
                <Badge size='sm' shape='pill' intent='primary' emphasis='solid'>
                  {tab.count}
                </Badge>
              )}
            </BottomNavLink>
          ))}
          <BottomNavMore>
            {MORE.map((item) => (
              <BottomNavMoreItem key={item.label} href='#' current={page === item.label} onClick={go(item.label)}>
                {item.icon}
                <span>{item.label}</span>
              </BottomNavMoreItem>
            ))}
          </BottomNavMore>
        </BottomNavList>
        <BottomNavAction aria-label='New task'>
          <IconPlus />
        </BottomNavAction>
      </BottomNav>
    </div>
  );
}
